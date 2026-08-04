import express from "express";
import cors from "cors";
import documentRoutes from "./routes/document-routes.js";
import chatRoutes from "./routes/chat-routes.js";

const app = express();
app.use(express.json());

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use("/api", documentRoutes);
app.use("/api", chatRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;
