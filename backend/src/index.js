import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import workflowRoutes from "./routes/workflows.js";

const app = express();

// ✅ CORS (correct)
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ REQUIRED FOR COOKIES
app.use(cookieParser());

// JSON body parsing
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/workflows", workflowRoutes);

const PORT = 5050;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
