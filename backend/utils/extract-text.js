import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export async function extractTextFromFile(file) {
  const { mimetype, buffer } = file;

  if (mimetype === "text/plain") {
    return buffer.toString("utf-8");
  }

  if (mimetype === "application/pdf") {
    // pdf-parse v2: named export PDFParse + getText() (not default export pdf(buffer))
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return result.text;
    } finally {
      await parser.destroy();
    }
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