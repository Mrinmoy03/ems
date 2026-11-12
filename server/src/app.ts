import express, { Application, Request, Response } from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import routes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app: Application = express();

// Enable Cross-Origin Resource Sharing (CORS)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body Parsing
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Static uploads directory (ensures server/uploads/avatars exists and is served)
const uploadsDirs = [
  path.resolve(__dirname, "../uploads"),
  path.resolve(process.cwd(), "server/uploads"),
  path.resolve(process.cwd(), "uploads"),
];
uploadsDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch {}
  }
  const avatarsSubdir = path.join(dir, "avatars");
  if (!fs.existsSync(avatarsSubdir)) {
    try {
      fs.mkdirSync(avatarsSubdir, { recursive: true });
    } catch {}
  }
  app.use("/uploads", express.static(dir));
});

// System Health Endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "online",
    system: "WorkTrack Enterprise Management System API",
    version: "2.4.0",
    timestamp: new Date().toISOString(),
    governance: "Mon–Sat 48-Hour Corporate Standard",
  });
});

// Mount modular API routes
app.use("/api", routes);

// 404 & Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

