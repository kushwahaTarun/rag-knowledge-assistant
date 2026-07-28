export interface DocumentType {
  id: string;
  title: string;
  created_at?: string;
}

export interface KnowledgeBaseDocType {
  documents: DocumentType[];
}
