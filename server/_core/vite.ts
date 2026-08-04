import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

// Compatible with Node.js 18 (import.meta.dirname was added in Node.js 21)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        __dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // In production, the server is bundled into dist/index.js
  // So __dirname is '/app/dist' (when bundled with esbuild)
  // The static files are in 'dist/public'
  
  const rootDir = process.cwd();
  const distPublicPath = path.resolve(rootDir, "dist", "public");
  const appDistPublicPath = "/app/dist/public";
  // When bundled, __dirname is the output dir (e.g., /app/dist)
  // The public files are in __dirname/public
  const relativePublicPath = path.resolve(__dirname, "public");
  // Also try parent of __dirname + public (in case __dirname is deeper)
  const parentPublicPath = path.resolve(path.dirname(__dirname), "public");

  const possiblePaths = [
    distPublicPath,
    appDistPublicPath,
    relativePublicPath,
    parentPublicPath,
    path.resolve(rootDir, "public"),
  ];

  let distPath = "";
  console.log(`[Static] Current working directory: ${rootDir}`);
  console.log(`[Static] __dirname: ${__dirname}`);

  for (const p of possiblePaths) {
    console.log(`[Static] Checking path: ${p}`);
    if (fs.existsSync(p)) {
      const files = fs.readdirSync(p);
      console.log(`[Static] Path exists. Files: ${files.slice(0, 5).join(", ")}${files.length > 5 ? "..." : ""}`);
      if (files.includes("index.html")) {
        distPath = p;
        console.log(`[Static] Found valid dist directory at: ${distPath}`);
        break;
      }
    } else {
      console.log(`[Static] Path does not exist: ${p}`);
    }
  }

  if (!distPath) {
    distPath = distPublicPath;
    console.error(`[Static] CRITICAL: Could not find build directory with index.html. Defaulting to: ${distPath}`);
    
    // Emergency directory listing
    try {
      console.log(`[Static] Root listing: ${fs.readdirSync(rootDir).join(", ")}`);
      if (fs.existsSync(path.join(rootDir, "dist"))) {
        console.log(`[Static] dist listing: ${fs.readdirSync(path.join(rootDir, "dist")).join(", ")}`);
      }
    } catch (e) {
      console.error(`[Static] Error listing directories: ${e}`);
    }
  }

  // Serve static files from the public folder (client/public/)
  // This handles /main/*, /fonts/*, /images/* etc.
  const clientPublicPath = path.resolve(rootDir, "client", "public");
  if (fs.existsSync(clientPublicPath)) {
    app.use(express.static(clientPublicPath));
  }

  // Also serve from distPath (the Vite build output)
  app.use(express.static(distPath));

  app.use("*", (req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({
        error: "Not Found",
        message: `The requested URL ${req.originalUrl} was not found on this server.`,
        debug: {
          cwd: rootDir,
          distPath: distPath,
          indexPath: indexPath,
          exists: fs.existsSync(indexPath)
        }
      });
    }
  });
}
