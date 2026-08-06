import { supabase } from "../db/supabaseClient.js";

import { storeDocument } from "../services/document-service.js";
import { searchChunks } from "../services/search-service.js";
import { streamAnswer } from "../services/ai-service.js";
import { extractTextFromFile } from "../utils/extract-text.js";

export async function getDocuments(req, res, next) {
  try {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return res.status(200).json({ success: true, documents: data });
  } catch (err) {
    next(err);
  }
}

export async function getDocumentContent(req, res, next) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Document id is required" });
    }

    const { data, error } = await supabase
      .from("documents")
      .select("title, content, file_url")
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      document: data,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteDocument(req, res, next) {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ error: "Id of the document is required to delete a document" });
    }

    // Read file_url before deleting the row
    const { data: doc, error: fetchError } = await supabase
      .from("documents")
      .select("file_url")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    // Remove from bucket if present
    if (doc?.file_url) {
      await removeDocumentFile(doc.file_url);
    }

    const { error } = await supabase.from("documents").delete().eq("id", id);

    if (error) {
      throw error("Error while deleting the document");
    }

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
}

// Controller function to store a new document and its chunks in the database
export async function createDocument(req, res, next) {
  try {
    const { title, fullText } = req.body;

    // if title or fullText is missing, return a 400 error
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    let text = "";

    if (req.file) {
      text = await extractTextFromFile(req.file);
    } else if (fullText) {
      text = fullText;
    } else {
      return res.status(400).json({
        error: "Please provide a .txt, .pdf, or .docx file, or paste text",
      });
    }

    if (!text.trim()) {
      return res.status(400).json({ message: "Document cannot be empty" });
    }

    const result = await storeDocument(title, text, req.file ?? null);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

// Controller function that is responsible for generating a response of the user asked question
export async function askQuestion(req, res, next) {
  try {
    const { question, conversationId } = req.body;

    // if question is missing, return a 400 error
    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }
    
    const matched_chunks = await searchChunks(question);
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    for await (const chunk of streamAnswer(question, matched_chunks)) {
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    next(err);
  }
}
