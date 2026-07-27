import { ai } from "../utils/ai.js";
import { systemPrompt } from "../prompts/system-prompt.js";

// generate embedding for a chunk using the gemini embedding model
export async function generateEmbedding(chunk) {
  try {
    const response = await ai.models.embedContent({
      model: process.env.GEMINI_EMBEDDING_MODEL,
      contents: chunk,
      config: { outputDimensionality: 768 },
    });

    return response.embeddings[0].values;
  } catch (err) {
    console.error("Embedding generation failed", err);
    throw new Error("Embedding API returned empty result");
  }
}

export async function generateAnswer(question, matched_chunks) {
  const context = matched_chunks.map((chunk) => chunk.content).join("\n\n");

  const prompt = `Context:\n${context}\n\nQuestion: ${question}`;

  const interaction = await ai.interactions.create({
    model: process.env.GEMINI_MODEL,
    system_instruction: systemPrompt,
    input: prompt,
  });

  return interaction.output_text;
}
