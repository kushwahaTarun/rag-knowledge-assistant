import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

// Load env BEFORE creating the client (module runs top-to-bottom once)
dotenv.config();

// Single shared client for the whole backend
export const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});
