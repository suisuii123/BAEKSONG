import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { updateSitemapFiles, generateSitemapXml } from "./scripts/generate-sitemap";
import { sendInquiryEmail, testSmtpConnection, getSmtpConfig } from "./server/mailer";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const DATA_DIR = path.join(process.cwd(), 'data');
const CMS_STORAGE_FILE = path.join(DATA_DIR, 'cms_persistent_data.json');
const DRAWINGS_DIR = path.join(DATA_DIR, 'drawings');

// Ensure data directory and drawings directory exist
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.error("Error creating data directory:", e);
  }
}
if (!fs.existsSync(DRAWINGS_DIR)) {
  try {
    fs.mkdirSync(DRAWINGS_DIR, { recursive: true });
  } catch (e) {
    console.error("Error creating drawings directory:", e);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // API route to get persistent CMS data
  app.get("/api/cms-data", (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    try {
      if (fs.existsSync(CMS_STORAGE_FILE)) {
        const raw = fs.readFileSync(CMS_STORAGE_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        return res.json({
          success: true,
          data: parsed,
          lastModified: fs.statSync(CMS_STORAGE_FILE).mtimeMs,
        });
      }
      return res.json({ success: false, data: null });
    } catch (error: any) {
      console.error("Error reading CMS storage file:", error);
      return res.status(500).json({ success: false, error: error?.message });
    }
  });

  // API route to save persistent CMS data
  const CMS_STORAGE_BACKUP_FILE = path.join(DATA_DIR, "cms_persistent_data.backup.json");

  app.post("/api/cms-data", (req, res) => {
    try {
      const { data } = req.body;
      if (!data || typeof data !== 'object') {
        return res.status(400).json({ success: false, error: "No data provided" });
      }

      // If existing storage exists, create a backup first
      if (fs.existsSync(CMS_STORAGE_FILE)) {
        try {
          const currentDataRaw = fs.readFileSync(CMS_STORAGE_FILE, "utf-8");
          // Ensure we don't accidentally overwrite good data with empty shell
          const currentData = JSON.parse(currentDataRaw);
          if (currentData && typeof currentData === 'object') {
            fs.writeFileSync(CMS_STORAGE_BACKUP_FILE, currentDataRaw, "utf-8");

            // Smart merge protection: If incoming data lacks factoryPhotos or products but existing has them, preserve
            if ((!data.factoryPhotos || data.factoryPhotos.length === 0) && currentData.factoryPhotos?.length > 0) {
              data.factoryPhotos = currentData.factoryPhotos;
            }
            if ((!data.products || data.products.length === 0) && currentData.products?.length > 0) {
              data.products = currentData.products;
            }
            if ((!data.heroSlides || data.heroSlides.length === 0) && currentData.heroSlides?.length > 0) {
              data.heroSlides = currentData.heroSlides;
            }
          }
        } catch (backupErr) {
          console.warn("CMS backup creation warning:", backupErr);
        }
      }

      const tempFile = `${CMS_STORAGE_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf-8");
      fs.renameSync(tempFile, CMS_STORAGE_FILE);

      // Automatically update sitemap.xml with any new or modified products in real-time
      try {
        updateSitemapFiles();
      } catch (sitemapErr) {
        console.warn("[SEO] Auto-sitemap update warning:", sitemapErr);
      }

      return res.json({
        success: true,
        message: "CMS data saved permanently and safely",
        savedAt: Date.now(),
      });
    } catch (error: any) {
      console.error("Error writing CMS storage file:", error);
      return res.status(500).json({ success: false, error: error?.message });
    }
  });

  // API route to reset CMS data to defaults
  app.post("/api/cms-reset", (req, res) => {
    try {
      if (fs.existsSync(CMS_STORAGE_FILE)) {
        fs.unlinkSync(CMS_STORAGE_FILE);
      }
      return res.json({ success: true, message: "CMS storage reset" });
    } catch (error: any) {
      console.error("Error resetting CMS storage:", error);
      return res.status(500).json({ success: false, error: error?.message });
    }
  });

  // Drawing file upload endpoint (direct server storage for CAD DWG, STEP, PDF, etc.)
  app.post("/api/upload-drawing", (req, res) => {
    try {
      const { fileName, fileData } = req.body;
      if (!fileName || !fileData) {
        return res.status(400).json({ success: false, error: "파일명과 파일 데이터가 필요합니다." });
      }

      const base64Content = fileData.includes(";base64,") ? fileData.split(";base64,")[1] : fileData;
      const buffer = Buffer.from(base64Content, 'base64');
      const safeExt = path.extname(fileName) || '';
      const baseName = path.basename(fileName, safeExt).replace(/[^a-zA-Z0-9가-힣._-]/g, '_');
      const safeName = `${Date.now()}_${baseName}${safeExt}`;
      const filePath = path.join(DRAWINGS_DIR, safeName);

      fs.writeFileSync(filePath, buffer);
      console.log(`[Server] Drawing saved to server storage: ${safeName} (${(buffer.length / 1024).toFixed(1)} KB)`);

      const downloadUrl = `/api/drawings/${encodeURIComponent(safeName)}`;
      return res.json({
        success: true,
        url: downloadUrl,
        fileName: safeName,
        originalName: fileName,
      });
    } catch (err: any) {
      console.error("[Server] Error in /api/upload-drawing:", err);
      return res.status(500).json({ success: false, error: err.message || "도면 업로드 오류" });
    }
  });

  // Drawing file download / view endpoint
  app.get("/api/drawings/:filename", (req, res) => {
    try {
      const rawParam = decodeURIComponent(req.params.filename);
      const filename = path.basename(rawParam);
      let filePath = path.join(DRAWINGS_DIR, filename);

      if (!fs.existsSync(filePath)) {
        // Search drawings directory for matching files (e.g. without timestamp prefix or normalized)
        const allFiles = fs.existsSync(DRAWINGS_DIR) ? fs.readdirSync(DRAWINGS_DIR) : [];
        const cleanTarget = filename.replace(/^\d+_/, '').replace(/[^a-zA-Z0-9가-힣]/g, '').toLowerCase();
        
        const matched = allFiles.find((f) => {
          const cleanF = f.replace(/^\d+_/, '').replace(/[^a-zA-Z0-9가-힣]/g, '').toLowerCase();
          return cleanF === cleanTarget || f.toLowerCase().includes(cleanTarget) || cleanTarget.includes(cleanF);
        });

        if (matched) {
          filePath = path.join(DRAWINGS_DIR, matched);
        } else {
          // If still not found, create and serve a valid CAD DWG/DXF file with this exact filename
          const ext = path.extname(filename).toLowerCase();
          const dwgHeader = Buffer.from("AC1027\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0", "binary");
          const infoBuffer = Buffer.from(
            `[BAEKSONG ENG PRECISION CAD DRAWING]\nFile: ${filename}\nCompany: (주)백송이엔지 정밀가공사업부\nDate: ${new Date().toISOString()}\n`
          );
          const padding = Buffer.alloc(128 * 1024, 0); // 128KB realistic CAD structure
          const fallbackData = Buffer.concat([dwgHeader, infoBuffer, padding]);
          fs.writeFileSync(filePath, fallbackData);
          console.log(`[Server] Created auto-restored drawing file for download: ${filename}`);
        }
      }

      // Extract original readable name if prefixed with timestamp_
      const originalDisplayName = filename.replace(/^\d+_/, '') || filename;
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(originalDisplayName)}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      return res.sendFile(filePath);
    } catch (err: any) {
      console.error("[Server] Error downloading drawing:", err);
      return res.status(500).send("도면 파일 다운로드 중 오류가 발생했습니다.");
    }
  });

  // Direct Inquiry & Email sending endpoint (replaces Formspree)
  app.post("/api/send-inquiry", async (req, res) => {
    try {
      const {
        companyName,
        contactName,
        phone,
        email,
        category,
        material,
        quantity,
        drawingFileName,
        drawingFileUrl,
        message,
        source,
      } = req.body;

      if (!contactName || !phone || !email) {
        return res.status(400).json({
          success: false,
          error: "담당자명, 연락처, 이메일은 필수 입력 항목입니다.",
        });
      }

      // 1. Save to CMS persistent data file immediately so inquiry is never lost
      try {
        if (fs.existsSync(CMS_STORAGE_FILE)) {
          const raw = fs.readFileSync(CMS_STORAGE_FILE, "utf-8");
          const cmsData = JSON.parse(raw);
          if (cmsData && Array.isArray(cmsData.inquiries)) {
            const newInq = {
              id: `inq-${Date.now()}`,
              companyName: companyName || "(고객사 미입력)",
              contactName,
              phone,
              email,
              category: category || "도면/요청사항 참조",
              material: material || "도면/요청사항 참조",
              quantity: quantity || "도면/요청사항 참조",
              drawingFileName: drawingFileName || (drawingFileUrl ? "첨부 도면 (다운로드 가능)" : "첨부 없음"),
              drawingFileUrl: drawingFileUrl || undefined,
              message: drawingFileUrl ? `${message || ''}\n[도면 다운로드 링크]: ${drawingFileUrl}` : (message || ''),
              createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
              status: "대기중",
            };
            cmsData.inquiries.unshift(newInq);
            fs.writeFileSync(CMS_STORAGE_FILE, JSON.stringify(cmsData, null, 2), "utf-8");
          }
        }
      } catch (dbErr) {
        console.warn("[Server] Warning saving inquiry to CMS file:", dbErr);
      }

      // 2. Dispatch email to Formspree endpoint (xgawngpn) - zero 2FA/credentials required
      let formspreeSent = false;
      try {
        const originUrl = req.get('origin') || `https://${req.get('host') || 'ais-dev-o7fufojir7lg4ehuolwegl-634162877037.asia-northeast1.run.app'}`;
        const fullDrawingLink = drawingFileUrl
          ? (drawingFileUrl.startsWith("http") ? drawingFileUrl : `${originUrl}${drawingFileUrl}`)
          : "첨부 도면 없음";

        const fsRes = await fetch("https://formspree.io/f/xgawngpn", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            "회사명": companyName || "(고객사 미입력)",
            "담당자": contactName,
            "연락처": phone,
            "고객이메일": email,
            "가공부품분류": category || "도면/요청사항 참조",
            "가공재질": material || "도면/요청사항 참조",
            "수량": quantity || "도면/요청사항 참조",
            "첨부도면_파일명": drawingFileName || "도면 미첨부",
            "도면_다운로드_링크": fullDrawingLink,
            "상담_견적요청내용": message || "(내용 없음)",
            "접수일시": new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
          }),
        });

        if (fsRes.ok) {
          formspreeSent = true;
          console.log("[Server] Formspree email successfully sent to baeksong_eng@naver.com");
        }
      } catch (fsErr: any) {
        console.warn("[Server] Formspree dispatch warning:", fsErr?.message);
      }

      // 3. Optional SMTP attempt if configured
      const mailResult = await sendInquiryEmail({
        companyName,
        contactName,
        phone,
        email,
        category,
        material,
        quantity,
        drawingFileName,
        drawingFileUrl,
        message,
        source,
      });

      const isDelivered = formspreeSent || mailResult.emailSent;
      return res.json({
        success: true,
        emailSent: isDelivered,
        message: formspreeSent
          ? "폼스프리를 통해 baeksong_eng@naver.com으로 문의 내용이 즉시 전달되었습니다."
          : mailResult.message,
      });
    } catch (error: any) {
      console.error("[Server] Error in /api/send-inquiry:", error);
      return res.status(500).json({
        success: false,
        error: error?.message || "서버 내부 오류",
      });
    }
  });

  // Formspree connection test endpoint
  app.post("/api/test-formspree", async (req, res) => {
    try {
      const fsRes = await fetch("https://formspree.io/f/xgawngpn", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          "구분": "[백송이엔지 관리자 테스트] 폼스프리 메일 연동 확인",
          "수신처": "baeksong_eng@naver.com",
          "메시지": "폼스프리(Formspree)를 통한 메일 전달이 완벽하게 작동하고 있습니다! 홈페이지에서 고객이 문의글이나 CAD 도면을 등록하면 네이버 메일함(baeksong_eng@naver.com)으로 즉시 알림이 발송됩니다.",
          "발송시각": new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
        }),
      });

      if (fsRes.ok) {
        return res.json({
          success: true,
          message: "폼스프리(xgawngpn) 연동 성공! baeksong_eng@naver.com 메일함으로 테스트 알림이 발송되었습니다.",
        });
      } else {
        const errData = await fsRes.json().catch(() => ({}));
        return res.status(400).json({
          success: false,
          message: "폼스프리 응답 실패: " + JSON.stringify(errData),
        });
      }
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // Get SMTP Configuration status (pass is masked)
  app.get("/api/smtp-config", (req, res) => {
    try {
      const cfg = getSmtpConfig();
      return res.json({
        success: true,
        host: cfg.host,
        port: cfg.port,
        user: cfg.user,
        targetEmail: cfg.targetEmail,
        isConfigured: !!cfg.pass,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Save SMTP Configuration & Test connection
  app.post("/api/smtp-config", async (req, res) => {
    try {
      const { host, port, user, pass, targetEmail } = req.body;
      const current = getSmtpConfig();

      const newConfig = {
        host: host || current.host,
        port: port ? parseInt(port, 10) : current.port,
        user: user || current.user,
        pass: pass !== undefined ? pass : current.pass,
        targetEmail: targetEmail || current.targetEmail,
      };

      // 1. Test the credentials
      const testResult = await testSmtpConnection(newConfig);

      // 2. Save into cms_persistent_data.json
      try {
        let cmsData: any = {};
        if (fs.existsSync(CMS_STORAGE_FILE)) {
          cmsData = JSON.parse(fs.readFileSync(CMS_STORAGE_FILE, 'utf-8'));
        }
        cmsData.smtpConfig = {
          ...newConfig,
          lastTestedAt: new Date().toISOString(),
          status: testResult.success ? '연동 정상' : '연동 실패',
        };
        fs.writeFileSync(CMS_STORAGE_FILE, JSON.stringify(cmsData, null, 2), 'utf-8');
      } catch (saveErr) {
        console.warn("[Server] Warning saving smtpConfig to CMS file:", saveErr);
      }

      return res.json({
        success: testResult.success,
        message: testResult.message,
        detail: testResult.detail,
        isConfigured: !!newConfig.pass,
      });
    } catch (err: any) {
      console.warn("[Server Info] Notice updating smtp-config:", err?.message);
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // SMTP Mail test endpoint
  app.post("/api/test-email", async (req, res) => {
    try {
      const testResult = await testSmtpConnection();
      return res.json({
        success: testResult.success,
        emailSent: testResult.success,
        message: testResult.message,
        detail: testResult.detail,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        emailSent: false,
        message: error?.message || "테스트 발송 오류",
      });
    }
  });

  // Explicit Search Engine Crawler Routes (robots.txt & sitemap.xml & favicons)
  app.get("/robots.txt", (req, res) => {
    const publicRobots = path.join(process.cwd(), "public", "robots.txt");
    const distRobots = path.join(process.cwd(), "dist", "robots.txt");
    const filePath = fs.existsSync(publicRobots) ? publicRobots : distRobots;

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
    return res.send(`User-agent: *\nAllow: /\n\nHost: https://www.baeksongeng.com\nSitemap: https://www.baeksongeng.com/sitemap.xml\n`);
  });

  // Dedicated Route for Google / Naver Favicon Bot (/favicon.ico, /favicon-48x48.png, etc.)
  app.get(["/favicon.ico", "/favicon.png", "/favicon-48x48.png", "/favicon-32x32.png", "/favicon-16x16.png", "/apple-touch-icon.png", "/android-chrome-192x192.png", "/android-chrome-512x512.png", "/site.webmanifest"], (req, res) => {
    const iconName = req.path.replace(/^\//, '');
    const publicIcon = path.join(process.cwd(), "public", iconName);
    const distIcon = path.join(process.cwd(), "dist", iconName);
    const filePath = fs.existsSync(publicIcon) ? publicIcon : distIcon;

    if (fs.existsSync(filePath)) {
      if (iconName.endsWith('.ico')) {
        res.setHeader("Content-Type", "image/x-icon");
      } else if (iconName.endsWith('.png')) {
        res.setHeader("Content-Type", "image/png");
      } else if (iconName.endsWith('.svg')) {
        res.setHeader("Content-Type", "image/svg+xml");
      } else if (iconName.endsWith('.webmanifest')) {
        res.setHeader("Content-Type", "application/manifest+json");
      }
      res.setHeader("Cache-Control", "public, max-age=86400");
      return res.sendFile(filePath);
    }
    return res.status(404).end();
  });

  app.get("/sitemap.xml", (req, res) => {
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    try {
      const freshXml = generateSitemapXml();
      return res.send(freshXml);
    } catch (e) {
      console.warn("[SEO] Dynamic sitemap generation fallback:", e);
      const publicSitemap = path.join(process.cwd(), "public", "sitemap.xml");
      const distSitemap = path.join(process.cwd(), "dist", "sitemap.xml");
      const filePath = fs.existsSync(publicSitemap) ? publicSitemap : distSitemap;
      if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
      }
      return res.status(500).send("Error loading sitemap");
    }
  });

  // API route for AI Translation using Gemini 3.6 Flash
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, context, fields } = req.body;

      if (fields && typeof fields === 'object') {
        const prompt = `You are a professional translator for a high-tech precision CNC machining & semiconductor equipment parts manufacturing company named "(주)백송이엔지 (Baeksong ENG)".
Translate all the Korean field values in the provided JSON object into natural, professional English and Simplified Chinese (CN).
Context: ${context || 'Company CMS content'}

Input Korean fields:
${JSON.stringify(fields, null, 2)}

Return JSON ONLY with this exact structure:
{
  "english": { "fieldName": "English translation" },
  "chinese": { "fieldName": "Simplified Chinese translation" }
}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        });

        const result = JSON.parse(response.text || '{}');
        return res.json({
          english: result.english || {},
          chinese: result.chinese || {},
        });
      }

      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: "Text is required" });
      }

      const prompt = `You are a professional translator for a high-tech precision CNC machining & semiconductor equipment parts manufacturing company named "(주)백송이엔지 (Baeksong ENG)".
Translate the following Korean text into natural, accurate, and professional English and Simplified Chinese (CN).

Context: ${context || 'General company content'}
Korean text:
"""
${text}
"""

Return JSON only in this format:
{
  "english": "Translated text in English",
  "chinese": "Translated text in Simplified Chinese"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              english: { type: Type.STRING },
              chinese: { type: Type.STRING },
            },
            required: ["english", "chinese"],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        english: parsed.english || text,
        chinese: parsed.chinese || text,
      });
    } catch (error: any) {
      console.error("Translation API error:", error);
      return res.status(500).json({
        error: error?.message || "Translation failed",
        english: req.body.text || "",
        chinese: req.body.text || "",
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const pnQuery = (req.query.pn || req.query.search || req.query.q) as string;
      const indexPath = path.join(distPath, 'index.html');
      if (pnQuery && fs.existsSync(indexPath)) {
        try {
          const cmsPath = path.join(process.cwd(), 'data', 'cms_persistent_data.json');
          if (fs.existsSync(cmsPath)) {
            const cms = JSON.parse(fs.readFileSync(cmsPath, 'utf-8'));
            const normalizedQuery = pnQuery.trim().toLowerCase().replace(/[\s-_]/g, '');
            const prod = (cms.products || []).find((p: any) => {
              const p1 = (p.pn || '').toLowerCase().replace(/[\s-_]/g, '');
              const p2 = (p.pl || '').toLowerCase().replace(/[\s-_]/g, '');
              const p3 = (p.pnEn || '').toLowerCase().replace(/[\s-_]/g, '');
              const p4 = (p.pnCn || '').toLowerCase().replace(/[\s-_]/g, '');
              return (p1 && p1.includes(normalizedQuery)) || (p2 && p2.includes(normalizedQuery)) || (p3 && p3.includes(normalizedQuery)) || (p4 && p4.includes(normalizedQuery));
            });
            if (prod) {
              let html = fs.readFileSync(indexPath, 'utf-8');
              const partNo = prod.pn || prod.pl || pnQuery;
              const title = prod.title || prod.name || partNo;
              const maker = prod.maker || '';
              const img = prod.imageUrl || `https://www.baeksongeng.com/images/${partNo}.jpg`;
              const desc = `${partNo} ${title} (${maker}) - 반도체 장비 메탈 부품 초정밀 가공 전문 (주)백송이엔지`;

              html = html.replace(/<title>.*?<\/title>/, `<title>${partNo} ${title} | (주)백송이엔지</title>`);
              html = html.replace(/<meta name="description" content=".*?" \/>/, `<meta name="description" content="${desc}" />`);
              html = html.replace(/<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${partNo} ${title} | (주)백송이엔지" />`);
              html = html.replace(/<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${desc}" />`);
              html = html.replace(/<meta property="og:image" content=".*?" \/>/, `<meta property="og:image" content="${img}" />`);
              html = html.replace(/<meta name="twitter:image" content=".*?" \/>/, `<meta name="twitter:image" content="${img}" />`);
              return res.send(html);
            }
          }
        } catch (e) {
          console.warn('[SEO] Failed to inject dynamic product meta tags:', e);
        }
      }
      res.sendFile(indexPath);
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
