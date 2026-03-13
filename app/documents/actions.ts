"use server";

import { revalidatePath } from "next/cache";
import {
  addDocument,
  attachDocumentToTrip as attachDoc,
  detachDocumentFromTrip as detachDoc,
} from "@/lib/documents-store";
import type { Document, DocumentCategory } from "@/types/document";

// Uploads a document to the global vault (no trip attachment).
export async function uploadDocument(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const category = (formData.get("category") as DocumentCategory) ?? "other";
  if (!name) return;

  // TODO: Replace mock logic with:
  // 1. Upload file to Supabase Storage:
  //    const file = formData.get("file") as File;
  //    const { data: storageData } = await supabase.storage
  //      .from("documents").upload(`${Date.now()}-${file.name}`, file);
  // 2. Insert document record:
  //    await supabase.from("documents").insert({
  //      name, category,
  //      file_url: storageData.path,
  //      mime_type: file.type,
  //    });
  const newDoc: Document = {
    id: `doc-${Date.now()}`,
    name,
    category,
    fileUrl: null,
    mimeType: null,
    uploadedAt: new Date().toISOString().split("T")[0],
  };

  addDocument(newDoc);
  revalidatePath("/documents");
  revalidatePath("/");
}

// Attaches an existing vault document to a trip.
export async function attachDocumentToTrip(tripId: string, documentId: string) {
  // TODO: Replace with:
  // await supabase.from("trip_documents")
  //   .insert({ trip_id: tripId, document_id: documentId });
  attachDoc(tripId, documentId);
  revalidatePath(`/trips/${tripId}`);
  revalidatePath("/documents");
}

// Detaches a document from a trip (does not delete the document from the vault).
export async function detachDocumentFromTrip(tripId: string, documentId: string) {
  // TODO: Replace with:
  // await supabase.from("trip_documents").delete()
  //   .match({ trip_id: tripId, document_id: documentId });
  detachDoc(tripId, documentId);
  revalidatePath(`/trips/${tripId}`);
  revalidatePath("/documents");
}

// Uploads a new document and immediately attaches it to a trip.
export async function uploadAndAttachDocument(tripId: string, formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const category = (formData.get("category") as DocumentCategory) ?? "other";
  if (!name) return;

  // TODO: Replace mock logic with:
  // 1. Upload file to Supabase Storage (see uploadDocument above).
  // 2. Insert document record and get back the new ID.
  // 3. Insert trip_document join record:
  //    await supabase.from("trip_documents")
  //      .insert({ trip_id: tripId, document_id: newDoc.id });
  const newDoc: Document = {
    id: `doc-${Date.now()}`,
    name,
    category,
    fileUrl: null,
    mimeType: null,
    uploadedAt: new Date().toISOString().split("T")[0],
  };

  addDocument(newDoc);
  attachDoc(tripId, newDoc.id);
  revalidatePath(`/trips/${tripId}`);
  revalidatePath("/documents");
}
