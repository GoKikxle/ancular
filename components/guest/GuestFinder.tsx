"use client";

import { useRef, useState } from "react";
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
  // The selfie's face code, kept in memory for this visit only (never saved), so a
  // "yes, that's me" can search again for that person at other angles.
  const faceCode = useRef<number[] | null>(null);
  const refining = useRef(false);

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
    faceCode.current = embedding;
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

  // Quietly search again after a confirmation: confirmed photos act as extra
  // reference faces, which finds side profiles the selfie alone missed.
  async function refine() {
    if (preview || !faceCode.current || refining.current) return;
    refining.current = true;
    const { data } = await createClient().rpc("match_my_face", {
      p_event: eventId,
      p_embedding: toVectorLiteral(faceCode.current),
    });
    refining.current = false;
    if (data) setMatches(data as Match[]);
  }

  async function withdraw() {
    faceCode.current = null;
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
        <p role="alert" className="t-ui mb-6 rounded-[4px] bg-danger-soft px-3 py-2.5 !text-danger">
          {error}
        </p>
      )}

      {stage === "consent" && <ConsentStep eventName={eventName} onAgree={agree} />}

      {stage === "selfie" && (
        <div className="max-w-xl">
          <h1 className="display">Take a selfie</h1>
          <p className="t-lead t-muted mt-5">
            Face the camera in good light, just you in the picture. The photo stays on your phone.
          </p>
          <div className="mt-8">
            <SelfieCamera onFace={search} />
          </div>
          {searchedOnce && (
            <button type="button" className="btn btn-quiet btn-lg mt-2 w-full max-w-sm" onClick={() => setStage("results")}>
              Back to my photos
            </button>
          )}
        </div>
      )}

      {stage === "searching" && (
        <div aria-live="polite" aria-busy="true">
          <h1 className="display">Looking for you…</h1>
          <p className="t-lead t-muted mt-4">Checking every photo from the event. This takes a few seconds.</p>
          <ul aria-hidden="true" className="mt-8 columns-2 gap-2 md:mt-12 md:columns-3 md:gap-8 lg:columns-4">
            {[5, 4, 6, 4, 5, 6, 4, 5].map((h, i) => (
              <li key={i} className="mb-2 break-inside-avoid md:mb-8">
                <span className="skeleton block rounded-[2px]" style={{ aspectRatio: `4 / ${h}` }} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {stage === "results" && (
        <PhotoResults
          eventName={eventName}
          matches={matches}
          onChange={setMatches}
          onSearchAgain={() => setStage("selfie")}
          onWithdraw={withdraw}
          onConfirmed={refine}
        />
      )}
    </div>
  );
}
