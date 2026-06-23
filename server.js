import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import handler from "./api/check-price.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// API route (compatible with the existing Vercel-style handler)
app.all("/api/check-price", handler);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, "dist");

// Serve the Vite build
app.use(express.static(distPath));

// SPA fallback (Express 5 compatible)
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
