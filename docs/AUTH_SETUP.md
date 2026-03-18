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

## Checklist

- [ ] `NEXT_PUBLIC_SITE_URL` set to your production URL on Vercel
- [ ] Supabase **Site URL** matches your app URL
- [ ] Supabase **Redirect URLs** include `*/auth/callback` and `*/**` for your domains
- [ ] Email provider enabled in Supabase (Authentication → Providers → Email)
- [ ] Magic link enabled if using passwordless login
