import { ai, openrouter } from "../utils/ai.js";
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
    throw new Error("Embedding API returned empty result");
  }
}

export async function* streamAnswer(question, matched_chunks) {
  const context = matched_chunks.map((chunk) => chunk.content).join("\n\n");

  const prompt = `Context:\n${context}\n\nQuestion: ${question}`;
  try {
    const interaction = await ai.interactions.create({
      model: process.env.GEMINI_MODEL,
      system_instruction: systemPrompt,
      input: prompt,
      stream: true,
    });

    for await (const event of interaction) {
      if (event.event_type === "step.delta" && event.delta?.type == "text") {
        yield event.delta.text;
      }
    }
  } catch (err) {
    // QUOTA/RATE LIMIT EXCEEDED SO START USING THE OPENROUTER MODEL
    if (err.status === 429) {
      // Stream the response to get reasoning tokens in usage
      const stream = await openrouter.chat.send({
        chatRequest: {
          model: process.env.OPENROUTER_MODEL,
          messages: [
            {
              content: systemPrompt,
              role: "system",
            },
            {
              content: prompt,
              role: "user",
            },
          ],
          stream: true,
        },
      });

      for await (const chunk of stream) {
        const text = chunk.choices?.[0]?.delta?.content;
        if (text) {
          yield text;
        }
      }
      return;
    }
    throw new Error(err.message);
  }
}
