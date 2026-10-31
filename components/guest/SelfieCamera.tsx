"use client";

import { useEffect, useRef, useState } from "react";
import { SELFIE_PROBLEMS, preloadFaces, readSelfie, type FaceModel } from "@/lib/face";
import { drawScaled, loadBitmap } from "@/lib/image";

type CameraState = "starting" | "live" | "blocked" | "checking";

/**
 * Front camera with a face guide. Falls back to choosing a photo when the camera
 * is blocked or unavailable. Nothing captured here is uploaded.
 */
export function SelfieCamera({
  onFace,
  model = "v1",
  angled = false,
}: {
  onFace: (embedding: number[]) => void;
  model?: FaceModel;
  /** Second selfie with the head turned: the face finder is allowed to be less sure. */
  angled?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [camera, setCamera] = useState<CameraState>("starting");
  const [modelReady, setModelReady] = useState(false);
  const [flash, setFlash] = useState(0);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    preloadFaces(model, "guest")
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
  }, [model]);

  async function check(source: HTMLCanvasElement) {
    setProblem(null);
    setCamera((c) => (c === "live" ? "checking" : c));
    const result = await readSelfie(source, { model, angled });
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
    setFlash((n) => n + 1);
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
        <div className="relative aspect-[3/4] w-full max-w-sm overflow-hidden rounded-[2px] bg-black">
          {flash > 0 && <span key={flash} aria-hidden="true" className="shutter z-10" />}
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
              stroke={problem ? "#ff5a6e" : "rgba(255,255,255,0.85)"}
              strokeWidth="2"
              strokeDasharray="6 6"
            />
          </svg>
          {camera === "starting" && (
            <p className="t-ui absolute inset-x-0 bottom-4 text-center !text-white/70">Starting camera…</p>
          )}
        </div>
      )}

      {camera === "blocked" && (
        <div className="max-w-sm rounded-[4px] bg-fill p-4">
          <p className="t-item">The camera isn&apos;t available</p>
          <p className="t-item-sub mt-0.5">
            Allow camera access in your browser settings, or tap Take a photo to use your phone’s camera app.
          </p>
        </div>
      )}

      {problem && (
        <p role="alert" className="t-ui mt-4 max-w-sm rounded-[4px] bg-danger-soft px-3 py-2.5 !text-danger">
          {problem}
        </p>
      )}

      <div className="mt-4 flex max-w-sm flex-col gap-2">
        {camera !== "blocked" && (
          <button type="button" className="btn btn-primary btn-lg w-full" onClick={capture} disabled={busy || camera !== "live"}>
            {!modelReady ? "Getting ready…" : camera === "checking" ? "Checking…" : "Take selfie"}
          </button>
        )}
        <label className={`btn btn-lg ${camera === "blocked" ? "btn-primary" : "btn-quiet"} w-full cursor-pointer`}>
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
          {camera === "blocked" ? "Take a photo" : "Take a photo instead"}
        </label>
      </div>
      {!modelReady && (
        <p className="t-meta mt-3">First time only: downloading about 7 MB.</p>
      )}
    </div>
  );
}
