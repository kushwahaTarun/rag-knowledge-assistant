import express from "express";
import {
  getDocuments,
  createDocument,
  askQuestion,
  getDocumentContent,
  deleteDocument,
} from "../controllers/document-controller.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Endpoint to get the all the documents from the DB
router.get("/get-documents", getDocuments);

// Endpoint to store a document and its chunks in database
router.post("/documents", upload.single("file"), createDocument);

// Endpoint that returns the document content
router.get("/documents/:id", getDocumentContent);

// Endpoint to delete a document from the DB
router.delete("/documents/:id", deleteDocument);

// endpoint where user can ask a question and get an answer based on the stored chunks in the database
router.post("/ask", askQuestion);

export default router;
