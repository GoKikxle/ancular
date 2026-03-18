# Profile & Preset Avatar System

## Avatar file location

All avatar assets live in:

```
/public/avatars/
```

Current format: `avatar_1.svg` through `avatar_16.svg`  
Supported: `.svg` or `.png` (update `AVATAR_OPTIONS` in `lib/avatars.ts` if changing format)

## Adding new avatars

1. Add the image file to `/public/avatars/`, e.g. `avatar_17.png`
2. Update `lib/avatars.ts` and add to `AVATAR_OPTIONS`:

```ts
{ id: "avatar_17", src: "/avatars/avatar_17.png", alt: "Avatar 17" },
```

3. Ensure `DEFAULT_AVATAR_ID` or fallback logic covers the new IDs

## Profile data model

| Column     | Type    | Description                    |
|-----------|---------|--------------------------------|
| id        | uuid    | PK, FK to auth.users          |
| email     | text    | Denormalized from auth         |
| full_name | text    | Editable display name          |
| avatar_id | text    | Preset avatar id (e.g. avatar_1) |
| created_at| timestamptz | Set on insert             |
| updated_at| timestamptz | Set on update             |

## Components

- **`UserAvatar`** (`components/ui/UserAvatar.tsx`) — Reusable avatar with size variants: `small` (32px), `medium` (48px), `large` (96px)
- **`AvatarPicker`** (`components/settings/AvatarPicker.tsx`) — Grid picker for profile settings
- **`ProfileForm`** (`components/settings/ProfileForm.tsx`) — Profile edit form

## Profile helpers (`lib/profile.ts`)

- `getCurrentProfile()` — Load current user's profile (uses auth)
- `upsertProfile(updates)` — Create or update profile
- `getAvatarById(avatarId)` — Resolve avatar src/alt from AVATAR_OPTIONS (re-exported from `lib/avatars.ts`)
