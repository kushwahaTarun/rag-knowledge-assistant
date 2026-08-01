import { supabase } from "../db/supabaseClient.js";

import generateChunk from "../utils/chunk-text.js";
import { generateEmbedding } from "./ai-service.js";

export async function storeDocument(title, fullText) {
  const { data: document, error: docError } = await supabase
    .from("documents")
    .insert([{ title, content: fullText }])
    .select()
    .single();

  if (docError) throw docError;

  const chunks = generateChunk(fullText);

  for (const chunk of chunks) {
    const embedding = await generateEmbedding(chunk);

    const { error: chunkError } = await supabase.from("chunks").insert([
      {
        document_id: document.id,
        content: chunk,
        embedding: embedding,
      },
    ]);

    if (chunkError) throw chunkError;
  }

  return { document_id: document.id, chunks_count: chunks.length };
}
