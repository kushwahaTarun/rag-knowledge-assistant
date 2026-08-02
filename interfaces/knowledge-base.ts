export interface DocumentType {
  id: string;
  title: string;
  created_at?: string;
  file_url?: string | null;
}

export interface KnowledgeBaseDocType {
  documents: DocumentType[];
}
