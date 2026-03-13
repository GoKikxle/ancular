export type DocumentCategory = "flight" | "hotel" | "identity" | "booking" | "other";

export type Document = {
  id: string;
  name: string;
  category: DocumentCategory;
  // null in mock mode — will be a Supabase Storage URL in production
  fileUrl: string | null;
  mimeType: string | null;
  uploadedAt: string;
  notes?: string;
};
