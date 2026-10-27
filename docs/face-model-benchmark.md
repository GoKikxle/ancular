# Face model benchmark (October 2026)

Why face model v2 exists, and where its thresholds come from.

## Test sets

1. **Front-on:** the DeepFace project's unit-test set (github.com/serengil/deepface,
   tests/unit/dataset): 64 photos with 38 same-person and 262 different-person pairs.
   Mostly front-facing.
2. **Side angles:** 20 photos of 5 people from Pexels photo shoots, each person shot
   front-on and in profile under studio lighting. Same-shoot photos count as the same
   person; one shoot pair whose identity wasn't certain was left out.

Both were run in Chromium with the same code paths the app uses.

## Results

| Setup | Faces found (side set) | Side-set AUC | Side matches with zero false matches | Front-on |
|---|---|---|---|---|
| v1: face-api detector + face-api recognition (128-d) | 16/20 | 0.73 | 5% | 100% |
| Human: blazeface + faceres | 12/20 | 0.88 | 67% (of fewer faces) | 95% |
| Human: blazeface + mobilefacenet | 12/20 | broken codes | - | - |
| **v2: face-api detector + faceres (1024-d), 20% crop margin** | **16/20** | **0.90** | **48%** | **100%** |

The Human library's own detector missed most side profiles, so it was rejected even
though its codes were good. v2 keeps face-api's detectors (which find profiles) and
reads each face with faceres.

## Thresholds (cosine distance, v2)

- Front-on same-person pairs: 0.11–0.36. Closest different people: 0.354 (side set),
  0.379 (front-on), 0.444 (across sets).
- No false matches at or below 0.35 on either set.
- `sure` 0.32 (added straight away), `maybe` 0.46 (shown as "Is this you?", catches
  ~80% of side-angle pairs), `seed` 0.28, `expand` 0.32.

The in-app check matched these numbers within 0.04, and the selfie reader and the
host photo reader gave the same face codes 0.027 apart.

## Caveats

Small sets, dramatic studio lighting on the side set, and every "different person"
pair there is a similar-looking person, which makes it a hard test. Re-check the
thresholds against a real event once there is one.
