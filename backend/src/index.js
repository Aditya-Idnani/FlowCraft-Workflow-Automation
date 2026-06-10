import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import workflowRoutes from "./routes/workflows.js";
import { initScheduler } from "./scheduler.js";

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://flow-craft-workflow-automation.vercel.app",
];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// ✅ CORS - allow local development and the deployed Vercel frontend
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// ✅ REQUIRED FOR COOKIES
app.use(cookieParser());

// JSON body parsing
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/workflows", workflowRoutes);

const PORT = 5050;
app.listen(PORT, async () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  await initScheduler();
});
