import pdf from "pdf-parse";
import mammoth from "mammoth";

export async function extractTextFromFile(file) {
  const { mimetype, buffer } = file;

  if (mimetype === "text/plain") {
    return buffer.toString("utf-8");
  }

  if (mimetype === "application/pdf") {
    const data = await pdf(buffer);
    return data.text;
  }

  if (
    mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error("Unsupported file type");
}