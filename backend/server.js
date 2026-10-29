require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Authentication server is running." });
});

app.use("/api/auth", require("./routes/authRoutes"));

app.use((err, req, res, next) => {
  console.error(err.message);

  if (res.headersSent) return next(err);

  res.status(500).json({
    message: "Something went wrong. Please try again.",
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
    throw new Error("Please configure MONGODB_URI and JWT_SECRET in .env");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected successfully.");

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Server startup failed:", error.message);
  process.exit(1);
});