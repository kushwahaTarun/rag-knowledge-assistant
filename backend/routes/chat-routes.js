import express from "express";
import {
  createConversation,
  getAllConversations,
} from "../controllers/chat-controller.js";

const router = express.Router();

// ENDPOINT TO CREATE A NEW CONVERSATION IN THE DB
router.post("/conversations", createConversation);

// ENDPOINT TO GET ALL CONVERSATIONS FROM THE DB
router.get("/conversations", getAllConversations);

export default router;
