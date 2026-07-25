export default function generateChunk(text, chunkLength = 450, overlap = 50) {
  const textArr = text.split(" ");
  const chunks = [];

  for (let i = 0; i < textArr.length; i += chunkLength - overlap) {
    const chunk = textArr.slice(i, i + chunkLength).join(" ");
    chunks.push(chunk);
  }

  return chunks;
}