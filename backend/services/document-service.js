import { supabase } from "../db/supabaseClient.js";

import generateChunk from "../utils/chunk-text.js";
import { generateEmbedding } from "./ai-service.js";

export const DOCUMENTS_BUCKET = process.env.SUPABASE_DOCUMENTS_BUCKET;

function buildStoragePath(documentId, originalName) {
  const base =
    typeof originalName === "string" && originalName.trim()
      ? originalName.trim()
      : "file";
  const safe = base.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${documentId}/${safe}`;
}

/** Public URL → storage path for delete */
export function getPathFromPublicUrl(fileUrl) {
  if (!fileUrl || typeof fileUrl !== "string") return null;
  const marker = `/object/public/${DOCUMENTS_BUCKET}/`;
  const index = fileUrl.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(fileUrl.slice(index + marker.length));
}

export async function uploadDocumentFile(documentId, file) {
  const path = buildStoragePath(documentId, file.originalname);

  const { error: uploadError } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .upload(path, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(DOCUMENTS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function removeDocumentFile(fileUrl) {
  const path = getPathFromPublicUrl(fileUrl);
  if (!path) return;

  const { error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .remove([path]);

  if (error) throw error;
}

export async function storeDocument(title, fullText, file = null) {
  const { data: document, error: docError } = await supabase
    .from("documents")
    .insert([{ title, content: fullText }])
    .select()
    .single();

  if (docError) throw docError;

  // Only when user uploaded a file (not paste)
  if (file) {
    const fileUrl = await uploadDocumentFile(document.id, file);

    const { error: updateError } = await supabase
      .from("documents")
      .update({ file_url: fileUrl })
      .eq("id", document.id);

    if (updateError) throw updateError;
  }

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
