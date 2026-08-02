import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { OpenRouter } from "@openrouter/sdk";

// Load env BEFORE creating the client (module runs top-to-bottom once)
dotenv.config();

// Single shared client for the whole backend
export const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

export const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});
