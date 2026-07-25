import express from "express";
import {
  createDocument,
  askQuestion,
} from "../controllers/document-controller.js";

const router = express.Router();

// Endpoint to store a document and its chunks in database
router.post("/documents", createDocument);

// endpoint where user can ask a question and get an answer based on the stored chunks in the database
router.post("/ask", askQuestion);

export default router;
