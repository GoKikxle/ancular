import type { TripDocument } from "@/types/trip-document";

// Seed data linking documents to trips.
// TODO: Remove this file when migrating to Supabase.
// Replace with: supabase.from("trip_documents").select("*")
export const tripDocuments: TripDocument[] = [
  // Barcelona Getaway (trip id: "1")
  { id: "td-1", tripId: "1", documentId: "doc-1", attachedAt: "2025-04-01" },
  { id: "td-2", tripId: "1", documentId: "doc-2", attachedAt: "2025-04-01" },
  { id: "td-3", tripId: "1", documentId: "doc-3", attachedAt: "2025-03-15" },

  // Lagos Work Trip (trip id: "2")
  { id: "td-4", tripId: "2", documentId: "doc-4", attachedAt: "2025-04-10" },
  { id: "td-5", tripId: "2", documentId: "doc-5", attachedAt: "2025-04-10" },
  { id: "td-6", tripId: "2", documentId: "doc-6", attachedAt: "2025-04-10" },
];
