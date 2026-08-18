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
    try {
      if (fs.existsSync(CMS_STORAGE_FILE)) {
        const raw = fs.readFileSync(CMS_STORAGE_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        return res.json({ success: true, data: parsed });
      }
      return res.json({ success: false, data: null });
    } catch (error: any) {
      console.error("Error reading CMS storage file:", error);
      return res.status(500).json({ success: false, error: error?.message });
    }
  });

  // API route to save persistent CMS data
  app.post("/api/cms-data", (req, res) => {
    try {
      const { data } = req.body;
      if (!data) {
        return res.status(400).json({ success: false, error: "No data provided" });
      }
      fs.writeFileSync(CMS_STORAGE_FILE, JSON.stringify(data, null, 2), "utf-8");
      return res.json({ success: true, message: "CMS data saved permanently" });
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
