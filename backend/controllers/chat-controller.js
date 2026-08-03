import { supabase } from "../db/supabaseClient.js";

// FUNCTION THAT CREATED A NEW CONVERSATION IN THE DB
export async function createConversation(req, res, next) {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    const { data, error } = await supabase
      .from("conversations")
      .insert({ title })
      .select();

    if (error) {
      throw error;
    }

    return res.status(201).json({
      success: true,
      message: "Conversation created successfully",
      conversation: data[0],
    });
  } catch (error) {
    next(error);
  }
}

// FUNCTION THAT GETS ALL CONVERSATIONS FROM THE DB
export async function getAllConversations(req, res, next) {
  try {
    const { data, error } = await supabase.from("conversations").select("*");

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      conversations: data,
    });
  } catch (error) {
    next(error);
  }
}
