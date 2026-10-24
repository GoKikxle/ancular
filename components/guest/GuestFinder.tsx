"use client";

import { useState } from "react";
import { grantPreviewConsent, withdrawPreviewConsent } from "@/app/e/[code]/actions";
import { createClient } from "@/lib/supabase/client";
import { CONSENT_VERSION } from "@/lib/events";
import { plainError } from "@/lib/errors";
import { toVectorLiteral } from "@/lib/face";
import { ConsentStep } from "./ConsentStep";
import { SelfieCamera } from "./SelfieCamera";
import { PhotoResults } from "./PhotoResults";

export type Match = {
  photo_id: string;
  distance: number;
  confidence: "sure" | "maybe";
  confirmed?: boolean;
};

type Stage = "consent" | "selfie" | "searching" | "results";

type Props = {
  eventId: string;
  eventName: string;
  hasConsent: boolean;
  initialMatches: Match[];
  /** Local preview: consent stays on this device's session. The selfie is not uploaded or saved. */
  preview?: boolean;
};

export function GuestFinder({ eventId, eventName, hasConsent, initialMatches, preview = false }: Props) {
  const [stage, setStage] = useState<Stage>(
    !hasConsent ? "consent" : initialMatches.length ? "results" : "selfie"
  );
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [error, setError] = useState<string | null>(null);
  const [searchedOnce, setSearchedOnce] = useState(initialMatches.length > 0);

  async function agree() {
    setError(null);
    if (preview) {
      const result = await grantPreviewConsent(eventId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setStage("selfie");
      return;
    }
    const { error: err } = await createClient().rpc("grant_face_consent", {
      p_event: eventId,
      p_wording_version: CONSENT_VERSION,
    });
    if (err) {
      setError(plainError(err.message, "Could not save that. Try again."));
      return;
    }
    setStage("selfie");
  }

  async function search(embedding: number[]) {
    setStage("searching");
    setError(null);
    if (preview) {
      // The face code never leaves this function. Nothing is saved or sent.
      setMatches([]);
      setSearchedOnce(true);
      setStage("results");
      return;
    }
    const { data, error: err } = await createClient().rpc("match_my_face", {
      p_event: eventId,
      p_embedding: toVectorLiteral(embedding),
    });
    if (err) {
      setError(plainError(err.message, "Could not search just now. Try again."));
      setStage("selfie");
      return;
    }
    setMatches((data ?? []) as Match[]);
    setSearchedOnce(true);
    setStage("results");
  }

  async function withdraw() {
    if (preview) {
      const result = await withdrawPreviewConsent(eventId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setMatches([]);
      setSearchedOnce(false);
      setStage("consent");
      return;
    }
    const { error: err } = await createClient().rpc("withdraw_face_consent", { p_event: eventId });
    if (err) {
      setError(plainError(err.message, "Could not withdraw that. Try again."));
      return;
    }
    setMatches([]);
    setSearchedOnce(false);
    setStage("consent");
  }

  return (
    <div>
      {error && (
        <p role="alert" className="mb-6 rounded-xl bg-danger-soft px-4 py-3 text-danger">
          {error}
        </p>
      )}

      {stage === "consent" && <ConsentStep eventName={eventName} onAgree={agree} />}

      {stage === "selfie" && (
        <div className="mx-auto max-w-md">
          <h2 className="text-2xl font-bold">Take a selfie</h2>
          <p className="mt-2 text-ink-muted">
            Face the camera in good light, just you in the picture. The photo stays on your phone.
          </p>
          <div className="mt-6">
            <SelfieCamera onFace={search} />
          </div>
          {searchedOnce && (
            <button type="button" className="btn btn-quiet mt-4 w-full" onClick={() => setStage("results")}>
              Back to my photos
            </button>
          )}
        </div>
      )}

      {stage === "searching" && (
        <div className="py-16 text-center" aria-live="polite">
          <svg viewBox="0 0 48 48" className="mx-auto h-16 w-16" aria-hidden="true">
            <circle cx="24" cy="24" r="9" fill="var(--indigo)" />
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="var(--gold)"
              strokeWidth="4"
              strokeDasharray="30 96"
              className="origin-center animate-spin motion-reduce:animate-none"
            />
          </svg>
          <p className="mt-4 text-lg font-semibold">Looking through the event photos…</p>
        </div>
      )}

      {stage === "results" && (
        <PhotoResults
          eventName={eventName}
          matches={matches}
          onChange={setMatches}
          onSearchAgain={() => setStage("selfie")}
          onWithdraw={withdraw}
        />
      )}
    </div>
  );
}
