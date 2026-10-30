import { useState } from "react";
import ReviewForm from "../components/ReviewForm";
import ResultCard from "../components/ResultCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { analyzeReview } from "../services/api";

export default function Analyze() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(review, rating) {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await analyzeReview(review, rating);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-bold">Analyze a Review</h1>
      <ReviewForm onSubmit={handleSubmit} loading={loading} />
      {loading && <LoadingSpinner />}
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-800">{error}</p>
      )}
      {result && <ResultCard result={result} />}
    </div>
  );
}