# Ancular Auth Setup

## Environment variables

Add these to `.env.local` (local) or Vercel Project Settings → Environment Variables (production).

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL (e.g. `https://xxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous/public key |
| `NEXT_PUBLIC_SITE_URL` | Yes (prod) | Your app’s public URL. Used for magic link redirects. |

### `getURL()` fallback order

1. `NEXT_PUBLIC_SITE_URL` — explicit config (preferred in production)
2. `NEXT_PUBLIC_VERCEL_URL` — auto-set by Vercel (e.g. `your-app.vercel.app`)
3. `http://localhost:3000` — local development

---

## Supabase Dashboard URL settings

Go to: [Supabase Dashboard](https://supabase.com/dashboard) → Your project → **Authentication** → **URL Configuration**

### Site URL

| Environment | Site URL |
|-------------|----------|
| Local dev | `http://localhost:3000` |
| Production (Vercel) | `https://your-app.vercel.app` |

### Redirect URLs

Add every URL that Supabase may redirect users to after auth (magic link, OAuth, etc.):

**Local development**

```
http://localhost:3000/auth/callback
http://localhost:3000/**
```

**Vercel production**

```
https://your-app.vercel.app/auth/callback
https://your-app.vercel.app/**
```

**If using custom domain**

```
https://yourdomain.com/auth/callback
https://yourdomain.com/**
```

**Preview deployments (optional)**

To support Vercel preview URLs:

```
https://*.vercel.app/auth/callback
https://*.vercel.app/**
```

---

---

## Resend SMTP configuration (Supabase dashboard)

**Path:** [Supabase Dashboard](https://supabase.com/dashboard) → Your project → **Authentication** → **SMTP Settings**

Enable **Custom SMTP** and fill in:

| Setting | Value |
|--------|--------|
| **SMTP host** | `smtp.resend.com` |
| **SMTP port** | `465` (SMTPS) or `587` (STARTTLS) |
| **SMTP username** | `resend` |
| **SMTP password** | Your [Resend API key](https://resend.com/api-keys) |
| **Sender email** | `onboarding@resend.dev` (test) or `no-reply@yourdomain.com` (verified domain) |
| **Sender name** | `Ancular` (or your app name) |

### Resend prerequisites

1. [Verify your domain](https://resend.com/domains) at Resend (for production)
2. [Create an API key](https://resend.com/api-keys) — use this as the SMTP password
3. For testing: use `onboarding@resend.dev` (sends to your Resend account email only)
4. For production: use `no-reply@yourdomain.com` where `yourdomain.com` is verified

### After enabling custom SMTP

- [Auth > Rate Limits](https://supabase.com/dashboard/project/_/auth/rate-limits): increase from default 30/hour if needed
- Emails are sent via Resend; delivery appears in [Resend dashboard](https://resend.com/emails)

---

## Checklist

- [ ] `NEXT_PUBLIC_SITE_URL` set to your production URL on Vercel
- [ ] Supabase **Site URL** matches your app URL
- [ ] Supabase **Redirect URLs** include `*/auth/callback` and `*/**` for your domains
- [ ] Email provider enabled (Authentication → Providers → Email)
- [ ] Magic link enabled if using passwordless login
- [ ] **Custom SMTP** enabled with Resend credentials (Authentication → SMTP Settings)
