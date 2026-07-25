import { storeDocument } from "../services/document-service.js";
import { searchChunks } from "../services/search-service.js";
import { generateAnswer } from "../services/ai-service.js";

// Controller function to store a new document and its chunks in the database
export async function createDocument(req, res, next) {
  try {
    const { title, fullText } = req.body;

    // if title or fullText is missing, return a 400 error
    if (!title || !fullText) {
      return res.status(400).json({ error: "Title and fullText are required" });
    }

    const result = await storeDocument(title, fullText);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

// Controller function that is responsible for generating a response of the user asked question
export async function askQuestion(req, res, next) {
  try {
    const { question } = req.body;

    // if question is missing, return a 400 error
    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    const matched_chunks = await searchChunks(question);
    const answer = await generateAnswer(question, matched_chunks);
    res.status(200).json({ answer });
  } catch (err) {
    next(err);
  }
}
