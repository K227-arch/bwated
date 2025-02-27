import express from "express";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import "dotenv/config";
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.VITE_OPENAI_KEY;

// Configure Vite middleware for React client
const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: "custom",
});
app.use(vite.middlewares);

// API route for token generation
app.get("/token", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview-2024-12-17",
          voice: "verse",
        }),
      },
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Token generation error:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

// Move this outside of the route handler to cache the template
let templateHtml = null;

// Render the React client
app.use("*", async (req, res, next) => {
  try {
    // Only load and transform the template once
    if (!templateHtml) {
      const indexPath = path.resolve(__dirname, '../index.html');
      const rawHtml = fs.readFileSync(indexPath, "utf-8");
      templateHtml = await vite.transformIndexHtml(req.originalUrl, rawHtml);
    }

    // Load and render the component
    const { render } = await vite.ssrLoadModule("/src/components/ChatInterface.jsx");
    
    if (typeof render !== 'function') {
      throw new Error('SSR render function not available');
    }

    const appHtml = await render(req.originalUrl);
    const html = templateHtml.replace('<!--ssr-outlet-->', appHtml?.html || '');

    return res
      .status(200)
      .set({ "Content-Type": "text/html" })
      .end(html);

  } catch (error) {
    vite.ssrFixStacktrace(error);
    console.error('SSR Error:', error);
    next(error);
  }
});

app.listen(port, () => {
  console.log(`Express server running on *:${port}`);
});
