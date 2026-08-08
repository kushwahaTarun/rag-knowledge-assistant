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

// FUNCTION THAT STORES THE CHAT MESSAGES TO THE DB BELONG TO THE CONVERSATION
export async function addMessageToConversation(req, res, next) {
  const { role, content } = req.body;
  const { id } = req.params;

  // if the user role or the message is missing so returning an error
  if (!role || !content.trim()) {
    return res
      .status(400)
      .json({ success: false, error: "Role and content are required" });
  }

  // if the conversation id doesn't exists so returning an error to the user
  if (!id) {
    return res
      .status(400)
      .json({ success: false, error: "Conversation doesn't exists" });
  }

  try {
    // Must await — without it, data/error are from a Promise object (always undefined)
    const { data, error } = await supabase
      .from("messages")
      .insert({ role, content, conversation_id: id })
      .select();

    // incase of error throwing the error to the next middleware
    if (error) {
      throw error;
    }

    return res.status(201).json({
      success: true,
      message: data[0],
    });
  } catch (error) {
    next(error);
  }
}

// FUNCTION THAT RETURNS ALL THE CHATS PRESENT INSIDE THE CONVERSATION
export async function conversationAllChats(req, res, next) {
  const { id } = req.params;

  // returning an error if the conversation id is missing
  if (!id) {
    return res
      .status(400)
      .json({ success: false, error: "Conversation ID is required" });
  }

  try {
    const { data, error } = await supabase
      .from("conversations")
      .select("*, messages(*)")
      .eq("id", id);

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      conversation: data[0],
    });
  } catch (error) {
    next(error);
  }
}

// FUNCTION THAT DELETES A CONVERSATION AND ALL THE CHATS INSIDE IT
export async function deleteConversation(req, res, next) {
  const { id } = req.params;

  if (!id) {
    return res
      .status(400)
      .json({ success: false, error: "Conversation ID is required" });
  }

  try {
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return res
      .status(200)
      .json({ success: true, message: "Conversation deleted successfully" });
  } catch (error) {
    next(error);
  }
}
