# Ancular AI Skills

These skills help Claude operate inside the Ancular travel planning system.

## Project Stack

Next.js
TypeScript
Supabase
Tailwind
Vercel

## Core System Concepts

Trips
Timeline events
Documents
Trip documents

## Database Tables

trips
timeline_items
documents
trip_documents

## File Storage

Supabase Storage buckets:

hotel
flight
identity
booking
other

Documents are uploaded to storage first, then stored in the documents table and linked through trip_documents.

## Development Rules

Always prefer server actions.

Supabase queries live in /lib.

UI components live in /components.

Trip routes use:

app/trips/[tripId]

## Product Direction

Ancular is a Travel OS.

Key pillars:

Trips  
Timeline  
Documents  
AI itinerary  
Activity discovery  
Travel dashboard