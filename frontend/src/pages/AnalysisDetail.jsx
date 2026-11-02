import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ResultCard from "../components/ResultCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { getHistoryItem } from "../services/api";

export default function AnalysisDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getHistoryItem(id).then(setItem).catch((e) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <div className="space-y-3">
        <p role="alert" className="rounded bg-red-50 p-3 text-red-800">{error}</p>
        <Link to="/history" className="text-indigo-700 underline">Back to history</Link>
      </div>
    );
  }
  if (!item) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl space-y-4">
      <Link to="/history" className="text-sm text-indigo-700 underline">Back to history</Link>
      <h1 className="text-2xl font-bold">Analysis Details</h1>
      <div className="rounded-xl bg-white p-6 shadow">
        <h2 className="mb-1 font-semibold">Review</h2>
        <p className="whitespace-pre-wrap text-sm text-slate-700">{item.review}</p>
        <p className="mt-2 text-xs text-slate-500">
          {item.rating ? `Rating: ${item.rating}/5 - ` : ""}
          Analyzed on {new Date(item.created_at).toLocaleString()}
        </p>
      </div>
      <ResultCard
        result={{
          prediction: item.label,
          confidence: item.confidence,
          signals: item.signals,
          terms: item.terms,
        }}
      />
    </div>
  );
}