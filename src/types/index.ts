export interface Document {
  id: string;
  title: string;
  filename: string;
  filePath: string;
  fileType: string;
  uploadDate: Date;
  topics: Topic[];
}

export interface Topic {
  id: string;
  documentId: string;
  title: string;
  description: string;
  images: string[];
  order: number;
}

export interface SearchResult {
  document: Document;
  topic: Topic;
  relevanceScore: number;
  matchedTerms: string[];
}

export interface SearchQuery {
  terms: string[];
  operator: 'AND' | 'OR';
}

export interface UploadResult {
  success: boolean;
  document?: Document;
  error?: string;
}
