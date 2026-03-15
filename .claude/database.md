# Ancular Database Schema

This document describes the Supabase schema used by the Ancular Travel OS.

## trips

Stores trips created by users.

Fields:

- id (uuid)
- title (text)
- slug (text)
- start_date (date)
- end_date (date)
- destination (text)
- next_action_title (text)
- next_action_description (text)
- created_at (timestamp)

---

## timeline_items

Stores itinerary events for trips.

Fields:

- id (uuid)
- trip_id (uuid → trips.id)
- time (text)
- title (text)
- note (text)
- location (text)
- document_label (text)
- sort_order (integer)
- created_at (timestamp)

Each row represents one itinerary event.

---

## documents

Stores uploaded document metadata.

Fields:

- id (uuid)
- name (text)
- title (text)
- file_url (text)
- mime_type (text)
- storage_path (text)
- storage_bucket (text)
- category (text)
- created_at (timestamp)

Files are stored in Supabase Storage and referenced here.

---

## trip_documents

Links documents to trips.

Fields:

- id (uuid)
- trip_id (uuid → trips.id)
- document_id (uuid → documents.id)
- label (text)
- created_at (timestamp)

This allows documents to be reused across trips.

---

## Storage Buckets

Supabase Storage buckets used by the system:

identity  
flight  
hotel  
booking  
other

Uploaded files are saved to the appropriate bucket based on document category.

---

## Relationships

Trips → Timeline

trips.id → timeline_items.trip_id

Trips → Documents

trips.id → trip_documents.trip_id

Documents → Trips

documents.id → trip_documents.document_id