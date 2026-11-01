import express, { Application, Request, Response } from "express";
import cors from "cors";
import path from "path";
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
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static uploads directory
app.use("/uploads", express.static(path.join(process.cwd(), process.env.UPLOAD_DIR || "uploads")));

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

