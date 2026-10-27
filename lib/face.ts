"use client";

/**
 * Face codes, computed in the browser.
 * Hosts: every face in each uploaded photo.
 * Guests: one face from the selfie. The selfie image never leaves the phone.
 */

type FaceApi = typeof import("@vladmandic/face-api");

/**
 * Which face model an event uses. Face codes from different models can't be compared,
 * so every event sticks to one: "v1" is the original small model (128 numbers per face),
 * "v2" reads each face with a stronger model (1024 numbers) that copes much better
 * with turned heads and side profiles.
 * New events use v2; older events move over when the host re-scans them.
 */
export type FaceModel = "v1" | "v2";

const loaders: Partial<Record<string, Promise<FaceApi>>> = {};

/**
 * host: full crowd detector (~5 MB) for group photos.
 * guest: small detector (~0.2 MB) for one close-up selfie, kinder on mobile data.
 * Both share the same landmark and recognition models, so face codes are comparable.
 */
export function loadFaceApi(
  mode: "host" | "guest" = "host",
  { detectorOnly = false }: { detectorOnly?: boolean } = {}
): Promise<FaceApi> {
  // v2 reads faces with its own model, so it only needs the detector from here.
  const key = `${mode}${detectorOnly ? ":detector" : ""}`;
  if (!loaders[key]) {
    loaders[key] = (async () => {
      const faceapi = await import("@vladmandic/face-api");
      // Phones without WebGL fall back to WebAssembly; serve its files from /public/tfjs.
      const tf = faceapi.tf as unknown as {
        setWasmPaths?: (path: string) => void;
        ready: () => Promise<void>;
      };
      tf.setWasmPaths?.("/tfjs/");
      await tf.ready();
      const detector = mode === "host" ? faceapi.nets.ssdMobilenetv1 : faceapi.nets.tinyFaceDetector;
      await Promise.all([
        detector.isLoaded ? null : detector.loadFromUri("/models"),
        detectorOnly || faceapi.nets.faceLandmark68Net.isLoaded
          ? null
          : faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        detectorOnly || faceapi.nets.faceRecognitionNet.isLoaded
          ? null
          : faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      ]);
      return faceapi;
    })().catch((err) => {
      delete loaders[key];
      throw err;
    });
  }
  return loaders[key]!;
}

export type DetectedFace = {
  embedding: number[];
  /** Fractions of the image size */
  box: { x: number; y: number; w: number; h: number };
  score: number;
};

export type Drawable = HTMLCanvasElement | HTMLImageElement | HTMLVideoElement;

export function sizeOf(input: Drawable) {
  if (input instanceof HTMLVideoElement) return { w: input.videoWidth, h: input.videoHeight };
  if (input instanceof HTMLImageElement) return { w: input.naturalWidth, h: input.naturalHeight };
  return { w: input.width, h: input.height };
}

export type Box = { x: number; y: number; w: number; h: number };

export function iou(a: Box, b: Box) {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.w, b.x + b.w);
  const y2 = Math.min(a.y + a.h, b.y + b.h);
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  return inter / (a.w * a.h + b.w * b.h - inter || 1);
}

export function cropCanvas(src: HTMLCanvasElement, x: number, y: number, w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  c.getContext("2d")!.drawImage(src, x, y, w, h, 0, 0, w, h);
  return c;
}

/**
 * All faces in a group photo.
 * The detector shrinks its input to 512px, so faces at the back of a crowd get lost.
 * We scan the whole photo and then four overlapping zoomed-in quarters, and merge duplicates.
 */
export async function detectAllFaces(input: HTMLCanvasElement, model: FaceModel = "v1"): Promise<DetectedFace[]> {
  if (model === "v2") {
    const { detectAllFacesV2 } = await import("./face-v2");
    return detectAllFacesV2(input);
  }
  const faceapi = await loadFaceApi("host");
  const W = input.width;
  const H = input.height;
  // 0.3 keeps more turned and side-on faces; a stray false "face" costs little,
  // since it won't be close to anyone's selfie.
  const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3, maxResults: 200 });

  const regions: { x: number; y: number; w: number; h: number }[] = [{ x: 0, y: 0, w: W, h: H }];
  if (Math.max(W, H) > 900) {
    const tw = Math.round(W * 0.6);
    const th = Math.round(H * 0.6);
    for (const x of [0, W - tw]) for (const y of [0, H - th]) regions.push({ x, y, w: tw, h: th });
  }

  const found: DetectedFace[] = [];
  for (const r of regions) {
    const source = r.w === W && r.h === H ? input : cropCanvas(input, r.x, r.y, r.w, r.h);
    const results = await faceapi.detectAllFaces(source, options).withFaceLandmarks().withFaceDescriptors();
    for (const res of results) {
      const b = res.detection.box;
      if (b.width < 24) continue; // too small to match reliably
      const box = { x: (r.x + b.x) / W, y: (r.y + b.y) / H, w: b.width / W, h: b.height / H };
      const face = { embedding: Array.from(res.descriptor), score: res.detection.score, box };
      const dupe = found.findIndex((f) => iou(f.box, box) > 0.35);
      if (dupe === -1) found.push(face);
      else if (face.score > found[dupe].score) found[dupe] = face;
    }
  }
  return found;
}

export type SelfieCheck =
  | { ok: true; face: DetectedFace }
  | { ok: false; reason: "no-face" | "many-faces" | "too-small" | "unclear" };

/**
 * One clear face from a selfie, or the reason it can't be used.
 * `angled`: the second, head-turned selfie, where the detector is naturally less sure.
 */
export async function readSelfie(
  input: Drawable,
  { model = "v1", angled = false }: { model?: FaceModel; angled?: boolean } = {}
): Promise<SelfieCheck> {
  if (model === "v2") {
    const { readSelfieV2 } = await import("./face-v2");
    return readSelfieV2(input, angled);
  }
  const faceapi = await loadFaceApi("guest");
  const { w, h } = sizeOf(input);
  const results = await faceapi
    .detectAllFaces(input, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 }))
    .withFaceLandmarks()
    .withFaceDescriptors();

  if (results.length === 0) return { ok: false, reason: "no-face" };

  // Use the biggest face; if two faces are close in size, ask for a solo selfie.
  const sorted = [...results].sort((a, b) => b.detection.box.area - a.detection.box.area);
  const [main, second] = sorted;
  if (second && second.detection.box.area > main.detection.box.area * 0.5) {
    return { ok: false, reason: "many-faces" };
  }
  if (main.detection.box.width < Math.min(w, h) * 0.18) return { ok: false, reason: "too-small" };
  if (main.detection.score < (angled ? 0.5 : 0.7)) return { ok: false, reason: "unclear" };

  return {
    ok: true,
    face: {
      embedding: Array.from(main.descriptor),
      score: main.detection.score,
      box: {
        x: main.detection.box.x / w,
        y: main.detection.box.y / h,
        w: main.detection.box.width / w,
        h: main.detection.box.height / h,
      },
    },
  };
}

/** Start downloading the face finder early, so it's ready by the time it's needed. */
export async function preloadFaces(model: FaceModel, mode: "host" | "guest") {
  if (model === "v2") {
    const { loadV2 } = await import("./face-v2");
    await loadV2(mode);
  } else {
    await loadFaceApi(mode);
  }
}

/** The database column a model's face codes live in. */
export function faceColumn(model: FaceModel) {
  return model === "v2" ? "embedding_v2" : "embedding";
}

/** pgvector text format */
export function toVectorLiteral(embedding: number[]) {
  return `[${embedding.map((n) => n.toFixed(6)).join(",")}]`;
}

export const SELFIE_PROBLEMS: Record<Exclude<SelfieCheck, { ok: true }>["reason"], string> = {
  "no-face": "We couldn't see a face. Face the camera in good light and try again.",
  "many-faces": "We can see more than one person. Take a selfie with just you in it.",
  "too-small": "Your face is too far away. Hold the phone a little closer.",
  unclear: "The photo is a bit unclear. Try again facing a window or light.",
};
