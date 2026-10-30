import { useState } from "react";

export default function ReviewForm({ onSubmit, loading }) {
  const [review, setReview] = useState("");
  const [rating, setRating] = useState("");
  const [localError, setLocalError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    if (!review.trim()) {
      setLocalError("Please enter a review.");
      return;
    }
    setLocalError("");
    onSubmit(review, rating);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-6 shadow">
      <div>
        <label htmlFor="review" className="mb-1 block font-medium">Product review</label>
        <textarea
          id="review"
          rows={6}
          maxLength={5000}
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Paste a product review here (English)..."
          className="w-full rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <p className="text-right text-xs text-slate-500">{review.length}/5000</p>
      </div>

      <div>
        <label htmlFor="rating" className="mb-1 block font-medium">Star rating (optional)</label>
        <select
          id="rating"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="rounded-lg border border-slate-300 p-2"
        >
          <option value="">No rating</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>{n} star{n > 1 && "s"}</option>
          ))}
        </select>
      </div>

      {localError && <p className="text-sm text-red-700" role="alert">{localError}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Analyzing..." : "Analyze Review"}
      </button>
    </form>
  );
}