"use client";

import { useRef, useState } from "react";
import { grantPreviewConsent, withdrawPreviewConsent } from "@/app/e/[code]/actions";
import { createClient } from "@/lib/supabase/client";
import { CONSENT_VERSION } from "@/lib/events";
import { plainError } from "@/lib/errors";
import { toVectorLiteral, type FaceModel } from "@/lib/face";
import { ConsentStep } from "./ConsentStep";
import { SelfieCamera } from "./SelfieCamera";
import { PhotoResults } from "./PhotoResults";

export type Match = {
  photo_id: string;
  distance: number;
  confidence: "sure" | "maybe";
  confirmed?: boolean;
};

type Stage = "consent" | "selfie" | "angle" | "searching" | "results";

type Props = {
  eventId: string;
  eventName: string;
  hasConsent: boolean;
  initialMatches: Match[];
  /** Local preview: consent stays on this device's session. The selfie is not uploaded or saved. */
  preview?: boolean;
  /** The event's face model; selfie codes must come from the same one. */
  faceModel?: FaceModel;
};

export function GuestFinder({ eventId, eventName, hasConsent, initialMatches, preview = false, faceModel = "v1" }: Props) {
  const [stage, setStage] = useState<Stage>(
    !hasConsent ? "consent" : initialMatches.length ? "results" : "selfie"
  );
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [error, setError] = useState<string | null>(null);
  const [searchedOnce, setSearchedOnce] = useState(initialMatches.length > 0);
  // The selfie face codes (front, and turned if taken), kept in memory for this visit
  // only (never saved), so a "yes, that's me" can search again for more angles.
  const faceCodes = useRef<number[][]>([]);
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

  // Ask the database for photos matching these selfie codes. Falls back to the
  // older one-code search if the database hasn't been updated yet.
  async function runSearch(codes: number[][]) {
    const supabase = createClient();
    const res = await supabase.rpc("find_my_photos", {
      p_event: eventId,
      p_codes: codes.map(toVectorLiteral),
    });
    if (res.error && /find_my_photos|function/i.test(res.error.message) && faceModel === "v1") {
      return supabase.rpc("match_my_face", { p_event: eventId, p_embedding: toVectorLiteral(codes[0]) });
    }
    return res;
  }

  // First selfie done: ask for a quick second one with the head turned.
  function gotFront(embedding: number[]) {
    faceCodes.current = [embedding];
    setStage("angle");
  }

  async function search(codes: number[][]) {
    setStage("searching");
    setError(null);
    if (preview) {
      // The face code never leaves this function. Nothing is saved or sent.
      setMatches([]);
      setSearchedOnce(true);
      setStage("results");
      return;
    }
    faceCodes.current = codes;
    const { data, error: err } = await runSearch(codes);
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
    if (preview || faceCodes.current.length === 0 || refining.current) return;
    refining.current = true;
    const { data } = await runSearch(faceCodes.current);
    refining.current = false;
    if (data) setMatches(data as Match[]);
  }

  async function withdraw() {
    faceCodes.current = [];
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
          <p className="t-meta">Step 1 of 2</p>
          <h1 className="display mt-3">Take a selfie</h1>
          <p className="t-lead t-muted mt-5">
            Face the camera in good light, just you in the picture. The photo stays on your phone.
          </p>
          <div className="mt-8">
            <SelfieCamera onFace={gotFront} model={faceModel} />
          </div>
          {searchedOnce && (
            <button type="button" className="btn btn-quiet btn-lg mt-2 w-full max-w-sm" onClick={() => setStage("results")}>
              Back to my photos
            </button>
          )}
        </div>
      )}

      {stage === "angle" && (
        <div className="max-w-xl">
          <p className="t-meta">Step 2 of 2</p>
          <h1 className="display mt-3">Now turn your head a little</h1>
          <p className="t-lead t-muted mt-5">
            Look slightly to one side, as if someone just called your name. This finds the photos taken of you from
            the side.
          </p>
          <div className="mt-8">
            <SelfieCamera key="angle" onFace={(code) => search([...faceCodes.current, code])} model={faceModel} angled />
          </div>
          <button
            type="button"
            className="btn btn-quiet btn-lg mt-2 w-full max-w-sm"
            onClick={() => search(faceCodes.current)}
          >
            Skip this step
          </button>
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
