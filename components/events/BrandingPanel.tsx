"use client";

import { useActionState, useState } from "react";
import { updateBranding, type FormState } from "@/app/(app)/events/actions";
import { brandUrl, type EventRow } from "@/lib/events";
import { createClient } from "@/lib/supabase/client";

const TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
const MAX_BYTES = 5 * 1024 * 1024;

function FilePick({
  eventId,
  kind,
  label,
  hint,
  initial,
}: {
  eventId: string;
  kind: "logo" | "cover";
  label: string;
  hint: string;
  initial: string | null | undefined;
}) {
  const [path, setPath] = useState(initial ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const url = brandUrl(path);
  const name = `brand_${kind}_path`;

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!TYPES.includes(file.type)) return setError("Use a JPG, PNG, WebP or SVG file.");
    if (file.size > MAX_BYTES) return setError("Keep the file under 5 MB.");
    setError(null);
    setBusy(true);
    const ext = file.type === "image/svg+xml" ? "svg" : file.type.split("/")[1].replace("jpeg", "jpg");
    const key = `${eventId}/${kind}-${Date.now()}.${ext}`;
    const { error: upErr } = await createClient()
      .storage.from("branding")
      .upload(key, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
    setBusy(false);
    if (upErr) return setError("Couldn't upload that file. Try again.");
    setPath(key);
  }

  return (
    <div>
      <p className="label">{label}</p>
      <p className="t-item-sub -mt-1 mb-3">{hint}</p>
      <input type="hidden" name={name} value={path} />
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className={kind === "logo" ? "br-logo mb-3" : "br-thumb mb-3"} />
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <label className="btn btn-quiet btn-sm cursor-pointer">
          {busy ? "Uploading…" : url ? "Replace" : "Upload"}
          <input type="file" accept={TYPES.join(",")} className="sr-only" onChange={onPick} disabled={busy} />
        </label>
        {url && (
          <button type="button" className="btn btn-quiet btn-sm" onClick={() => setPath("")}>
            Remove
          </button>
        )}
      </div>
      {error && <p className="t-ui mt-2 !text-danger">{error}</p>}
    </div>
  );
}

/** Branding for the invite page, and whether guests see photos yet. */
export function BrandingPanel({ event }: { event: EventRow }) {
  const [state, save, saving] = useActionState<FormState, FormData>(
    updateBranding.bind(null, event.id),
    undefined
  );

  return (
    <form action={save} className="space-y-8 border-t border-hairline pt-8">
      <div>
        <h2 className="t-title">Event cover and early visitors</h2>
        <p className="t-item-sub mt-2">
          Guests who open the link before photos are up see a &ldquo;photos coming soon&rdquo; page with your
          branding, instead of an empty search.
        </p>
      </div>

      <label className="choice-card flex items-start gap-3">
        <input type="checkbox" name="hold_photos" defaultChecked={event.photos_live === false} className="mt-1" />
        <span>
          <span className="t-ui block font-semibold">Hold photos until I&apos;m ready</span>
          <span className="t-item-sub block">
            Guests see the coming-soon page even after you upload, so you can add everything first. Untick to
            go live. With nothing uploaded, guests always see the coming-soon page.
          </span>
        </span>
      </label>

      <FilePick
        eventId={event.id}
        kind="cover"
        label="Event cover"
        hint="The event poster or a wide photo, at least 1600px across. Shown whole at the top of the page."
        initial={event.brand_cover_path}
      />

      <p className="t-item-sub">
        Your logo and brand colour come from your{" "}
        <a href="/profile" className="font-semibold text-ink underline underline-offset-4">
          organisation profile
        </a>
        .
      </p>

      <div>
        <label htmlFor="brand_message" className="label">
          Message for early visitors
        </label>
        <textarea
          id="brand_message"
          name="brand_message"
          className="field"
          rows={3}
          maxLength={280}
          defaultValue={event.brand_message ?? ""}
          placeholder={`The photos from ${event.name} aren't up yet. Check back on this link after the event.`}
        />
      </div>

      {state?.error && (
        <p role="alert" className="t-ui rounded-[4px] bg-danger-soft px-3 py-2.5 !text-danger">
          {state.error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
          {saving ? "Saving…" : "Save branding"}
        </button>
        <a href={`/e/${event.invite_code}?preview=coming-soon`} target="_blank" rel="noreferrer" className="btn btn-quiet btn-lg">
          Preview the page
        </a>
        {state?.saved && <span className="t-ui">Saved</span>}
      </div>
    </form>
  );
}
