import type { Document } from "@/types/document";

// Seed data for the global document vault.
// TODO: Remove this file when migrating to Supabase.
// Replace with: supabase.from("documents").select("*")
export const documents: Document[] = [
  {
    id: "doc-1",
    name: "Flight ticket",
    category: "flight",
    fileUrl: null,
    mimeType: null,
    uploadedAt: "2025-04-01",
  },
  {
    id: "doc-2",
    name: "Hotel confirmation",
    category: "hotel",
    fileUrl: null,
    mimeType: null,
    uploadedAt: "2025-04-01",
  },
  {
    id: "doc-3",
    name: "Passport copy",
    category: "identity",
    fileUrl: null,
    mimeType: null,
    uploadedAt: "2025-03-15",
  },
  {
    id: "doc-4",
    name: "Flight itinerary",
    category: "flight",
    fileUrl: null,
    mimeType: null,
    uploadedAt: "2025-04-10",
  },
  {
    id: "doc-5",
    name: "Hotel booking",
    category: "hotel",
    fileUrl: null,
    mimeType: null,
    uploadedAt: "2025-04-10",
  },
  {
    id: "doc-6",
    name: "Conference pass",
    category: "booking",
    fileUrl: null,
    mimeType: null,
    uploadedAt: "2025-04-10",
  },
];
