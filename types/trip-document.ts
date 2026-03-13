// Join table: which documents are attached to which trip.
// Mirrors the `trip_documents` table in Supabase.
export type TripDocument = {
  id: string;
  tripId: string;
  documentId: string;
  attachedAt: string;
};
