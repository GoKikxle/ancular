"use client";

/**
 * Face model v2.
 *
 * Same face finder as v1 (face-api's detectors, which find side profiles well),
 * but each face is read by a stronger model, "faceres" (1024 numbers per face),
 * which keeps the same person closer together across head angles. On our side-
 * profile test set this lifted matches found with zero false matches from 5% to
 * 48% (docs/face-model-benchmark.md).
 *
 * Codes are scaled to length 1 and compared with cosine distance in the database.
 * Model file: /public/models/faceres.json (+ .bin, about 7 MB).
 */

import { cropCanvas, iou, loadFaceApi, sizeOf, type DetectedFace, type Drawable, type SelfieCheck } from "./face";

type FaceApi = typeof import("@vladmandic/face-api");
type Graph = { execute: (x: unknown) => unknown };
type T = { shape: number[]; dataSync: () => Float32Array };

let graph: Promise<Graph> | null = null;

/** Faces are cropped as a square around the detected box, grown by this much. */
const MARGIN = 0.2;

async function loadFaceres(faceapi: FaceApi): Promise<Graph> {
  if (!graph) {
    const tf = faceapi.tf as unknown as { loadGraphModel: (url: string) => Promise<Graph> };
    graph = tf.loadGraphModel("/models/faceres.json").catch((err) => {
      graph = null;
      throw err;
    });
  }
  return graph;
}

/** Load the detector for this mode plus the v2 face reader. */
export async function loadV2(mode: "host" | "guest") {
  const faceapi = await loadFaceApi(mode, { detectorOnly: true });
  const model = await loadFaceres(faceapi);
  return { faceapi, model };
}

type PixelBox = { x: number; y: number; width: number; height: number };

/** Read one face: square crop around the box, 224×224, 1024 numbers, scaled to length 1. */
function readFace(faceapi: FaceApi, model: Graph, source: Drawable, box: PixelBox): number[] {
  const tf = faceapi.tf as unknown as {
    tidy: <R>(fn: () => R) => R;
    browser: { fromPixels: (x: Drawable) => { toFloat: () => { expandDims: (n: number) => unknown } } };
    image: { cropAndResize: (img: unknown, boxes: number[][], idx: number[], size: [number, number]) => unknown };
  };
  const { w, h } = sizeOf(source);
  const side = Math.max(box.width, box.height) * (1 + MARGIN);
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const crop = [(cy - side / 2) / h, (cx - side / 2) / w, (cy + side / 2) / h, (cx + side / 2) / w];
  const values = tf.tidy(() => {
    const pixels = tf.browser.fromPixels(source).toFloat().expandDims(0);
    const face = tf.image.cropAndResize(pixels, [crop], [0], [224, 224]);
    const out = model.execute(face) as T[] | T;
    const code = (Array.isArray(out) ? out : [out]).find((t) => t.shape[1] === 1024)!;
    return Array.from(code.dataSync());
  });
  let n = 0;
  for (const v of values) n += v * v;
  n = Math.sqrt(n) || 1;
  return values.map((v) => v / n);
}

/** All faces in a group photo: whole frame plus zoomed-in quarters for crowds, as in v1. */
export async function detectAllFacesV2(input: HTMLCanvasElement): Promise<DetectedFace[]> {
  const { faceapi, model } = await loadV2("host");
  const W = input.width;
  const H = input.height;
  const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3, maxResults: 200 });
  const regions: { x: number; y: number; w: number; h: number }[] = [{ x: 0, y: 0, w: W, h: H }];
  if (Math.max(W, H) > 900) {
    const tw = Math.round(W * 0.6);
    const th = Math.round(H * 0.6);
    for (const x of [0, W - tw]) for (const y of [0, H - th]) regions.push({ x, y, w: tw, h: th });
  }

  // Find faces first, merging duplicates across regions; read each face once at the end.
  const found: { box: DetectedFace["box"]; score: number; px: PixelBox }[] = [];
  for (const r of regions) {
    const source = r.w === W && r.h === H ? input : cropCanvas(input, r.x, r.y, r.w, r.h);
    const detections = await faceapi.detectAllFaces(source, options);
    for (const d of detections) {
      const b = d.box;
      if (b.width < 24) continue; // too small to match reliably
      const px = { x: r.x + b.x, y: r.y + b.y, width: b.width, height: b.height };
      const box = { x: px.x / W, y: px.y / H, w: px.width / W, h: px.height / H };
      const dupe = found.findIndex((f) => iou(f.box, box) > 0.35);
      if (dupe === -1) found.push({ box, score: d.score, px });
      else if (d.score > found[dupe].score) found[dupe] = { box, score: d.score, px };
    }
  }
  return found.map((f) => ({ box: f.box, score: f.score, embedding: readFace(faceapi, model, input, f.px) }));
}

export async function readSelfieV2(input: Drawable, angled: boolean): Promise<SelfieCheck> {
  const { faceapi, model } = await loadV2("guest");
  const { w, h } = sizeOf(input);
  const results = await faceapi.detectAllFaces(
    input,
    new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: angled ? 0.35 : 0.5 })
  );
  if (results.length === 0) return { ok: false, reason: "no-face" };

  const [main, second] = [...results].sort((a, b) => b.box.area - a.box.area);
  if (second && second.box.area > main.box.area * 0.5) return { ok: false, reason: "many-faces" };
  if (main.box.width < Math.min(w, h) * 0.18) return { ok: false, reason: "too-small" };
  if (main.score < (angled ? 0.5 : 0.7)) return { ok: false, reason: "unclear" };

  const b = main.box;
  return {
    ok: true,
    face: {
      embedding: readFace(faceapi, model, input, { x: b.x, y: b.y, width: b.width, height: b.height }),
      score: main.score,
      box: { x: b.x / w, y: b.y / h, w: b.width / w, h: b.height / h },
    },
  };
}
