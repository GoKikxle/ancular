import type { Document } from "@/types/document";
import type { TripDocument } from "@/types/trip-document";
import { documents as seedDocuments } from "@/data/documents";
import { tripDocuments as seedTripDocuments } from "@/data/trip-documents";

// Temporary in-memory stores seeded from static data.
// TODO: Replace each function with Supabase queries:
//   getDocuments()              → supabase.from("documents").select("*")
//   getDocumentById()           → supabase.from("documents").select("*").eq("id", id).single()
//   getDocumentsForTrip()       → supabase.from("trip_documents")
//                                   .select("documents(*)")
//                                   .eq("trip_id", tripId)
//   getUnattachedDocuments()    → same as above with a NOT IN subquery
//   getTripIdsForDocument()     → supabase.from("trip_documents").select("trip_id").eq("document_id", documentId)
//   addDocument()               → supabase.from("documents").insert(doc)
//                                   (+ supabase.storage.from("documents").upload(...) for the file)
//   attachDocumentToTrip()      → supabase.from("trip_documents").insert({ trip_id, document_id })
//   detachDocumentFromTrip()    → supabase.from("trip_documents").delete()
//                                   .match({ trip_id: tripId, document_id: documentId })

let docStore: Document[] = [...seedDocuments];
let tripDocStore: TripDocument[] = [...seedTripDocuments];

export function getDocuments(): Document[] {
  return docStore;
}

export function getDocumentById(id: string): Document | undefined {
  return docStore.find((d) => d.id === id);
}

export function getDocumentsForTrip(tripId: string): Document[] {
  const linkedIds = tripDocStore
    .filter((td) => td.tripId === tripId)
    .map((td) => td.documentId);
  return docStore.filter((d) => linkedIds.includes(d.id));
}

export function getUnattachedDocuments(tripId: string): Document[] {
  const attachedIds = tripDocStore
    .filter((td) => td.tripId === tripId)
    .map((td) => td.documentId);
  return docStore.filter((d) => !attachedIds.includes(d.id));
}

// Returns trip IDs (not Trip objects) to keep this store independent of trips-store.
export function getTripIdsForDocument(documentId: string): string[] {
  return tripDocStore
    .filter((td) => td.documentId === documentId)
    .map((td) => td.tripId);
}

export function addDocument(doc: Document): void {
  docStore = [...docStore, doc];
}

export function attachDocumentToTrip(tripId: string, documentId: string): void {
  const alreadyAttached = tripDocStore.some(
    (td) => td.tripId === tripId && td.documentId === documentId,
  );
  if (alreadyAttached) return;

  const newLink: TripDocument = {
    id: `td-${Date.now()}`,
    tripId,
    documentId,
    attachedAt: new Date().toISOString().split("T")[0],
  };
  tripDocStore = [...tripDocStore, newLink];
}

export function detachDocumentFromTrip(tripId: string, documentId: string): void {
  tripDocStore = tripDocStore.filter(
    (td) => !(td.tripId === tripId && td.documentId === documentId),
  );
}
