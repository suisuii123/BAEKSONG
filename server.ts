import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

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

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.error("Error creating data directory:", e);
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
    const publicSitemap = path.join(process.cwd(), "public", "sitemap.xml");
    const distSitemap = path.join(process.cwd(), "dist", "sitemap.xml");
    const filePath = fs.existsSync(publicSitemap) ? publicSitemap : distSitemap;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }

    try {
      const { generateSitemapXml } = require("./scripts/generate-sitemap");
      return res.send(generateSitemapXml());
    } catch {
      return res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.baeksongeng.com/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`);
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
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
