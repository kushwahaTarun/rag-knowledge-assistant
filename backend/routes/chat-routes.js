import express from "express";
import {
  createConversation,
  getAllConversations,
  addMessageToConversation,
} from "../controllers/chat-controller.js";

const router = express.Router();

// ENDPOINT TO CREATE A NEW CONVERSATION IN THE DB
router.post("/conversations", createConversation);

// ENDPOINT TO GET ALL CONVERSATIONS FROM THE DB
router.get("/conversations", getAllConversations);

// ENDPOINT THAT STORES THE USER/ASSISTANT MESSAGES BELONG TO THE CONVERSATION IN THE DB
router.post("/conversations/:id/messages", addMessageToConversation);

export default router;
