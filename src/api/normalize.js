/**
 * normalize — recursively converts MongoDB's `_id` to `id`.
 *
 * The backend returns documents with `_id` (Mongo's default). The entire
 * frontend was built expecting `id`. Rather than touch every component,
 * we normalize API responses at the boundary: every object gets an `id`
 * mirror of its `_id`, recursively (so nested company/job objects work too).
 *
 * Safe to call on anything — primitives pass through untouched.
 */
export function normalize(value) {
  if (Array.isArray(value)) {
    return value.map(normalize);
  }
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = normalize(v);
    }
    // Mirror _id → id if id isn't already present.
    if (out._id !== undefined && out.id === undefined) {
      out.id = String(out._id);
    }
    return out;
  }
  return value;
}
