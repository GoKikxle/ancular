# Ancular Architecture Guide

This file explains how code should be structured in the Ancular Travel OS.

## Core Principle

Ancular is a mobile-first travel command center.

Main product pillars:

- Trips
- Timeline
- Documents
- AI itinerary
- Activities
- Travel dashboard

Code should stay clean, reusable, and Supabase-backed.

---

## App Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase
- Vercel

---

## Routing Rules

Routes live in:

- `app/`

Examples:

- `app/page.tsx` → home
- `app/trips/[tripId]/page.tsx` → trip detail
- `app/trips/new/page.tsx` → create trip
- `app/documents/page.tsx` → documents vault

Do not put route logic inside `components/`.

---

## UI Rules

Reusable UI lives in:

- `components/`

Examples:

- `components/dashboard/`
- `components/trips/`
- `components/layout/`
- `components/documents/`

Rules:

- prefer small reusable components
- preserve dark mobile-first styling
- do not create giant page files
- avoid duplicating UI patterns
- prefer cards over tables
- keep touch-friendly spacing

---

## Data Access Rules

Supabase data access lives in:

- `lib/`

Examples:

- `lib/trips.ts`
- `lib/trip-mutations.ts`
- `lib/timeline-items.ts`
- `lib/supabase/server.ts`

Rules:

- page files orchestrate data
- lib files fetch and mutate data
- do not put raw Supabase queries all over the UI
- keep one clean query/mutation layer per domain

---

## Server Actions Rules

Server actions should be preferred for mutations.

Examples:

- create trip
- delete trip
- attach document
- upload document
- add timeline item

Server actions should live in route domains where appropriate, for example:

- `app/trips/actions.ts`
- `app/documents/actions.ts`

Rules:

- use `"use server"`
- keep actions focused
- call lib mutation helpers
- do not put business logic directly in client components

---

## Client Component Rules

Use client components only when necessary.

Valid reasons:

- local UI state
- dialogs
- dropdowns
- optimistic interaction
- drag and drop
- file input
- form interaction helpers

Prefer server components for pages and data loading.

---

## Supabase Rules

### Queries
Use the shared Supabase server client:

- `lib/supabase/server.ts`

### Storage
Documents are uploaded to Supabase Storage.

Current buckets:

- identity
- flight
- hotel
- booking
- other

### Database
Main tables:

- trips
- timeline_items
- documents
- trip_documents

Rules:

- keep schema usage consistent
- avoid mixing field names like `name` vs `title`
- use canonical field names consistently across code

---

## Domain Rules

### Trips
Trips are the main top-level object.

Trip pages should load:
- trip details
- next action
- timeline
- documents
- weather
- suggestions

### Timeline
Timeline items are itinerary events.

They should support:
- time
- title
- note
- optional location
- optional document label
- sort order

### Documents
Documents are reusable across trips.

Use:
- `documents` for metadata
- `trip_documents` for linking

Do not duplicate files per trip unless necessary.

---

## Design Rules

Ancular should feel like:

- premium
- calm
- modern
- mobile-first
- command center for travel

Design references:

- Linear
- Flighty
- Apple Wallet
- Notion

Rules:

- dark mode first
- strong hierarchy
- soft layered cards
- rounded corners
- subtle motion
- minimal clutter

---

## AI Coding Rules

When editing the codebase:

- inspect existing files first
- preserve current architecture
- do not rewrite unrelated files
- keep changes focused
- prefer minimal safe edits
- summarize changed files after editing

When adding new features:

1. add data/query layer in `lib/`
2. add or update server actions
3. update page orchestration
4. add or refine reusable UI components

---

## Feature Priorities

Current high-value priorities:

1. Smart Trip Dashboard
2. AI Smart Itinerary Builder
3. Travel Document Scanner

All new code should support those directions.