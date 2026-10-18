"use client";

import { useEffect, useRef, useState } from "react";
import { SELFIE_PROBLEMS, loadFaceApi, readSelfie } from "@/lib/face";
import { drawScaled, loadBitmap } from "@/lib/image";

type CameraState = "starting" | "live" | "blocked" | "checking";

/**
 * Front camera with a face guide. Falls back to choosing a photo when the camera
 * is blocked or unavailable. Nothing captured here is uploaded.
 */
export function SelfieCamera({ onFace }: { onFace: (embedding: number[]) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [camera, setCamera] = useState<CameraState>("starting");
  const [modelReady, setModelReady] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadFaceApi("guest")
      .then(() => !cancelled && setModelReady(true))
      .catch(() => !cancelled && setProblem("Couldn't load the face finder. Check your connection and refresh."));

    if (!navigator.mediaDevices?.getUserMedia) {
      queueMicrotask(() => !cancelled && setCamera("blocked"));
    } else {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false })
        .then((stream) => {
          if (cancelled) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => undefined);
          }
          setCamera("live");
        })
        .catch(() => !cancelled && setCamera("blocked"));
    }

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function check(source: HTMLCanvasElement) {
    setProblem(null);
    setCamera((c) => (c === "live" ? "checking" : c));
    const result = await readSelfie(source);
    if (result.ok) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      onFace(result.face.embedding);
      return;
    }
    setProblem(SELFIE_PROBLEMS[result.reason]);
    setCamera((c) => (c === "checking" ? "live" : c));
  }

  async function capture() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    await check(canvas);
  }

  async function fromFile(file: File) {
    try {
      const bitmap = await loadBitmap(file);
      const canvas = drawScaled(bitmap, 1280);
      bitmap.close();
      await check(canvas);
    } catch {
      setProblem("That photo couldn't be opened. Try a JPEG or take a new selfie.");
    }
  }

  const busy = camera === "checking" || !modelReady;

  return (
    <div>
      {camera !== "blocked" && (
        <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-3xl bg-indigo-deep">
          <video
            ref={videoRef}
            playsInline
            muted
            className="h-full w-full -scale-x-100 object-cover"
            aria-label="Camera preview"
          />
          {/* Face guide */}
          <svg viewBox="0 0 300 400" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
            <ellipse
              cx="150"
              cy="185"
              rx="92"
              ry="122"
              fill="none"
              stroke={problem ? "var(--danger)" : "var(--gold)"}
              strokeWidth="4"
              strokeDasharray="10 8"
            />
          </svg>
          {camera === "starting" && (
            <p className="absolute inset-x-0 bottom-4 text-center text-sm text-white/80">Starting camera…</p>
          )}
        </div>
      )}

      {camera === "blocked" && (
        <div className="rounded-3xl bg-indigo-soft p-6 text-center">
          <p className="font-semibold">The camera isn&apos;t available</p>
          <p className="mt-1 text-[0.95rem] text-ink-muted">
            Allow camera access in your browser settings, or choose a recent selfie from your phone instead.
          </p>
        </div>
      )}

      {problem && (
        <p role="alert" className="mt-4 rounded-xl bg-danger-soft px-4 py-3 text-danger">
          {problem}
        </p>
      )}

      <div className="mt-5 flex flex-col gap-3">
        {camera !== "blocked" && (
          <button type="button" className="btn btn-gold w-full" onClick={capture} disabled={busy || camera !== "live"}>
            {!modelReady ? "Getting ready…" : camera === "checking" ? "Checking…" : "Take selfie"}
          </button>
        )}
        <label className={`btn ${camera === "blocked" ? "btn-gold" : "btn-quiet"} w-full cursor-pointer`}>
          <input
            type="file"
            accept="image/*"
            capture="user"
            className="sr-only"
            disabled={!modelReady}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) fromFile(f);
              e.target.value = "";
            }}
          />
          {camera === "blocked" ? "Choose a selfie" : "Use a photo instead"}
        </label>
      </div>
      {!modelReady && (
        <p className="mt-3 text-center text-sm text-ink-muted">First time only: downloading about 7 MB.</p>
      )}
    </div>
  );
}
