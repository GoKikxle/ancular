"use client";

import { useActionState, useState } from "react";
import { saveOrgProfile, type ProfileState } from "@/app/(app)/profile/actions";
import { brandUrl } from "@/lib/events";
import type { OrgProfile } from "@/lib/org-profile";
import { createClient } from "@/lib/supabase/client";

const TYPES = ["image/png", "image/svg+xml", "image/webp", "image/jpeg"];

export function ProfileForm({ userId, profile }: { userId: string; profile: OrgProfile | null }) {
  const [state, save, saving] = useActionState<ProfileState, FormData>(saveOrgProfile, undefined);
  const [logo, setLogo] = useState(profile?.logo_path ?? "");
  const [busy, setBusy] = useState(false);
  const [upErr, setUpErr] = useState<string | null>(null);
  const [useColor, setUseColor] = useState(!!profile?.brand_color);
  const [color, setColor] = useState(profile?.brand_color ?? "#0f0d14");
  const logoUrl = brandUrl(logo);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!TYPES.includes(file.type)) return setUpErr("Use a PNG, SVG, WebP or JPG file.");
    if (file.size > 5 * 1024 * 1024) return setUpErr("Keep the file under 5 MB.");
    setUpErr(null);
    setBusy(true);
    const ext = file.type === "image/svg+xml" ? "svg" : file.type.split("/")[1].replace("jpeg", "jpg");
    const key = `org/${userId}/logo-${Date.now()}.${ext}`;
    const { error } = await createClient()
      .storage.from("branding")
      .upload(key, file, { contentType: file.type, cacheControl: "31536000" });
    setBusy(false);
    if (error) return setUpErr("Couldn't upload that file. Try again.");
    setLogo(key);
  }

  return (
    <form action={save} className="space-y-6">
      <div>
        <label htmlFor="org_name" className="label">
          Organisation name
        </label>
        <input
          id="org_name"
          name="org_name"
          className="field"
          maxLength={120}
          defaultValue={profile?.org_name ?? ""}
          placeholder="As guests know it"
        />
      </div>
      <div>
        <label htmlFor="website" className="label">
          Website
        </label>
        <input
          id="website"
          name="website"
          className="field"
          defaultValue={profile?.website ?? ""}
          placeholder="yourorganisation.org"
        />
      </div>

      <div>
        <p className="label">Logo</p>
        <p className="t-item-sub -mt-1 mb-3">
          Shown at the top of your invite pages. PNG or SVG with a transparent background works best.
        </p>
        <input type="hidden" name="logo_path" value={logo} />
        {logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="" className="br-logo mb-3" />
        )}
        <div className="flex flex-wrap items-center gap-2">
          <label className="btn btn-quiet btn-sm cursor-pointer">
            {busy ? "Uploading…" : logoUrl ? "Replace" : "Upload logo"}
            <input type="file" accept={TYPES.join(",")} className="sr-only" onChange={onPick} disabled={busy} />
          </label>
          {logoUrl && (
            <button type="button" className="btn btn-quiet btn-sm" onClick={() => setLogo("")}>
              Remove
            </button>
          )}
        </div>
        {upErr && <p className="t-ui mt-2 !text-danger">{upErr}</p>}
      </div>

      <div>
        <label className="t-ui flex items-center gap-2">
          <input type="checkbox" name="use_color" checked={useColor} onChange={(e) => setUseColor(e.target.checked)} />
          Use a brand colour
        </label>
        {useColor && (
          <div className="mt-3 flex items-center gap-3">
            <input
              type="color"
              className="br-swatch"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              aria-label="Brand colour"
            />
            <input
              name="brand_color"
              className="field max-w-[140px]"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              aria-label="Brand colour hex"
            />
          </div>
        )}
      </div>

      {state?.error && (
        <p role="alert" className="t-ui rounded-[4px] bg-danger-soft px-3 py-2.5 !text-danger">
          {state.error}
        </p>
      )}
      <div className="flex items-center gap-4">
        <button type="submit" className="btn btn-primary btn-lg" disabled={saving || busy}>
          {saving ? "Saving…" : "Save"}
        </button>
        {state?.saved && <span className="t-ui">Saved</span>}
      </div>
    </form>
  );
}
