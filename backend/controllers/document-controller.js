import { supabase } from "../db/supabaseClient.js";

import { storeDocument } from "../services/document-service.js";
import { searchChunks } from "../services/search-service.js";
import { generateAnswer } from "../services/ai-service.js";

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
      .select("title, content")
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

    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", id);

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
