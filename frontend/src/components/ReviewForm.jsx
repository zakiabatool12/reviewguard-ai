import { useState } from "react";
import { ScanSearch, Eraser, Star, FileText, Lightbulb } from "lucide-react";

const MAX = 5000;

const samples = [
  {
    label: "Promotional style",
    rating: 5,
    text: "Amazing!!! Best ever, everyone must buy this now!!! 100% guaranteed!!!",
  },
  {
    label: "Detailed style",
    rating: 4,
    text: "I bought this blender two months ago. It crushes ice well, but the lid is hard to remove and it is quite loud. Good value for the price, though the jug scratched after a few washes.",
  },
  {
    label: "Rating mismatch",
    rating: 5,
    text: "Terrible quality, stopped working after a day and the seller never replied.",
  },
];

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const current = Number(value) || 0;
  const shown = hover || current;

  return (
    <div>
      <div role="radiogroup" aria-label="Star rating (optional)" className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={current === n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onClick={() => onChange(current === n ? "" : n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="rounded p-1 transition hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 motion-reduce:transition-none motion-reduce:hover:scale-100"
          >
            <Star
              size={28}
              aria-hidden="true"
              className={n <= shown ? "text-amber-500" : "text-slate-300"}
              fill={n <= shown ? "currentColor" : "none"}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-slate-600">
          {current ? `${current} of 5` : "Not set"}
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-500">Optional. Click the selected star again to remove it.</p>
    </div>
  );
}

export default function ReviewForm({ onSubmit, loading, onClear }) {
  const [review, setReview] = useState("");
  const [rating, setRating] = useState("");
  const [localError, setLocalError] = useState("");

  const used = review.length;
  const pct = Math.min(100, Math.round((used / MAX) * 100));
  const nearLimit = used > MAX * 0.9;

  function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    if (!review.trim()) {
      setLocalError("Please enter a review before analyzing.");
      return;
    }
    setLocalError("");
    onSubmit(review.trim(), rating);
  }

  function clearAll() {
    setReview("");
    setRating("");
    setLocalError("");
    if (onClear) onClear();
  }

  function applySample(s) {
    setReview(s.text);
    setRating(s.rating);
    setLocalError("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
          <FileText size={20} aria-hidden="true" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900">Review to analyze</h2>
          <p className="text-xs text-slate-500">English reviews work best in this version.</p>
        </div>
      </div>

      <div>
        <p className="mb-2 flex items-center gap-1 text-xs font-medium text-slate-500">
          <Lightbulb size={14} aria-hidden="true" />
          Try an example
        </p>
        <div className="flex flex-wrap gap-2">
          {samples.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => applySample(s)}
              className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs text-slate-700 transition hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="review" className="mb-1 block text-sm font-medium text-slate-800">
          Product review
        </label>
        <textarea
          id="review"
          rows={7}
          maxLength={MAX}
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Paste a product review here..."
          aria-invalid={localError ? "true" : "false"}
          className="w-full rounded-lg border border-slate-300 p-3 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        />
        <div className="mt-1 flex items-center gap-3">
          <div className="h-1.5 flex-1 rounded bg-slate-200">
            <div
              className={`h-1.5 rounded ${nearLimit ? "bg-amber-500" : "bg-indigo-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className={`text-xs ${nearLimit ? "font-medium text-amber-700" : "text-slate-500"}`}>
            {used}/{MAX}
          </span>
        </div>
      </div>

      <div>
        <p className="mb-1 text-sm font-medium text-slate-800">Star rating</p>
        <StarRating value={rating} onChange={setRating} />
      </div>

      {localError && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {localError}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white shadow transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ScanSearch size={20} aria-hidden="true" />
          {loading ? "Analyzing..." : "Analyze review"}
        </button>
        <button
          type="button"
          onClick={clearAll}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-3 text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <Eraser size={18} aria-hidden="true" />
          Clear
        </button>
      </div>
    </form>
  );
}