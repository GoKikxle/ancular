# Ancular

Private, invite-only event photo sharing for Nigerian weddings, church programmes and parties.
Hosts upload the photos; guests take one selfie and see only the photos they appear in.

The previous travel app lives on the `archive/travel-app` branch.

## How it works

- **Hosts** create an event, upload photos and share an invite link / QR code.
  Faces are found **in the host's browser** while photos upload (with tiled scanning for small faces in crowds),
  and stored as 128-number face codes in Postgres (`pgvector`).
- **Guests** open the invite, sign in, join (hosts can approve each guest), tick the consent box,
  and take a selfie. The selfie **never leaves the phone**: its face code is computed on the device,
  sent once to `match_my_face()`, and not stored.
- Guests can only see photos they matched (row level security), confirm "maybe" matches,
  save full-size originals, share to WhatsApp, and delete their face data at any time.
- Face codes delete automatically after the event's retention period (`purge_expired_face_data()`).

## Stack

Next.js 16 (App Router) · Supabase (auth, Postgres + pgvector) · Cloudflare R2 for photos
(falls back to Supabase Storage) · `@vladmandic/face-api` (TensorFlow.js, MIT) in the browser · Tailwind CSS 4.

## Setup

1. **Supabase project.** A fresh project is cleanest (the travel app's tables can stay in the old one).
   In the SQL editor, run `supabase/migrations/0001_ancular_core.sql`.
   If you won't use R2, also run `0002_storage_bucket.sql`.
2. **Auto-delete face data.** Database → Extensions → enable `pg_cron`, then run:
   ```sql
   select cron.schedule('ancular-purge-faces', '15 3 * * *', 'select public.purge_expired_face_data()');
   ```
3. **Auth.** Authentication → URL configuration: set Site URL to your domain and add
   `https://YOUR-DOMAIN/auth/callback` (and `http://localhost:3000/auth/callback`) to redirect URLs.
   **Confirm email must be ON** (Authentication → Providers → Email → “Confirm email”).
   The app blocks hosts and guests until `email_confirmed_at` is set; without this dashboard
   setting, accounts can skip the inbox step.
4. **Analytics (optional).** Vercel Web Analytics + Speed Insights load only after the visitor
   chooses “Accept all” on the cookie banner. No custom events, no face/selfie/PII.
   Enable both in the Vercel project (Analytics / Speed Insights) so data shows in the dashboard.
5. **Cloudflare R2** (recommended). Create a bucket, an API token with read/write on it, and add this CORS policy
   so browsers can upload and fetch photos:
   ```json
   [
     {
       "AllowedOrigins": ["https://YOUR-DOMAIN", "http://localhost:3000"],
       "AllowedMethods": ["GET", "PUT"],
       "AllowedHeaders": ["Content-Type"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```
6. **Environment.** Copy `.env.example` to `.env.local` and fill it in. On Vercel, add the same variables.
7. Run it:
   ```bash
   npm install
   npm run dev
   ```

## Project layout

```
app/
  page.tsx                 landing page
  privacy/                 plain-language privacy page
  (auth)/login, signup     sign in / create account (supports ?next= for invites)
  (app)/dashboard          hosted and invited events
  (app)/events/new         create an event
  (app)/events/[id]        Photos · Guests · Share · Settings
  e/[code]                 the guest invite: join → consent → selfie → your photos
  api/events/[id]/photos   create a photo + signed upload URLs
  api/photos/[id]/[size]   signed view/download, access checked by RLS
components/brand           logo + adire pattern
components/events          uploader, grid, guest list, share panel, settings
components/guest           consent, selfie camera, results
lib/face.ts                face finding in the browser
lib/storage.ts             R2 / Supabase Storage
supabase/migrations        schema, RLS, matching function
public/models, public/tfjs face models and the WebAssembly engine (for phones without WebGL)
```

## Matching thresholds

`match_my_face()` treats distance ≤ 0.45 as "sure" and ≤ 0.55 as "maybe" (guest confirms).
Tune these once you have real event photos; lower numbers are stricter.

## MFA later (TOTP)

Email confirmation is the MVP second factor. To add authenticator-app MFA later:

1. Supabase Dashboard → Authentication → MFA → enable **TOTP**.
2. In Settings (or a new security page), call `supabase.auth.mfa.enroll({ factorType: "totp" })`,
   show the QR, then `supabase.auth.mfa.challenge` + `verify` on sign-in when `aal` is still `aal1`.
3. Optionally require `aal2` in `proxy.ts` for host routes (`/dashboard`, `/events`) while leaving
   guest invite browse lighter if needed.

## Security hardening (priority)

**Already strong:** selfie stays on device; guests only see matched photos via RLS; faces table host-only;
Stripe webhook signature + `metadata.app`; billing writes service-role only; share/view URLs signed after RLS;
invite pages `noindex`; local preview gated to development.

**Quick wins:** security headers/CSP; rate-limit join/match/upload/invite lookup; host-only Event pass checkout;
lock legacy `match_my_face` thresholds server-side; server-side age gate (not just checkbox).

**Medium:** shorter share-link TTL or one-time tokens; upload MIME/size verify after PUT; invite code entropy +
rotate; orphan `uploading` photo cleanup; structured logs without PII/embeddings.

**Later:** bot protection on signup; dependency scanning in CI; admin audit trail; MFA (above).

## Before launch

- Turn on **Confirm email** in Supabase Auth (see Setup §3).
- Have a Nigerian data protection lawyer review the consent wording (`components/guest/ConsentStep.tsx`)
  and the privacy page. Consent records store `CONSENT_VERSION` from `lib/events.ts`; bump it when wording changes.
- Phone-number sign-in (Supabase phone auth with an SMS provider such as Termii) will suit Nigerian guests
  better than email.
