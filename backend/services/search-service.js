import { supabase } from "../db/supabaseClient.js";
import { generateEmbedding } from "../services/ai-service.js";

// generate chunk for a user asked question and then match the chunk vector with the stored chunks vector in the supabase database and return the matched chunks
export async function searchChunks(question, match_count = 5) {
  const quesionEmbedding = await generateEmbedding(question);

  const result = await supabase.rpc("match_chunks", {
    query_embedding: quesionEmbedding,
    match_count,
  });

  if (result.error) throw result.error;
  return result.data;
}
