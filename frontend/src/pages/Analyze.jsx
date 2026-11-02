import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ScanSearch, Lightbulb, CheckCircle2, AlertCircle, LogIn } from "lucide-react";
import ReviewForm from "../components/ReviewForm";
import ResultCard from "../components/ResultCard";
import { analyzeReview } from "../services/api";
import { useAuth } from "../context/AuthContext";

function EmptyState() {
  const tips = [
    "A prediction with a model confidence score",
    "Words that influenced the model",
    "Rule-based warning signs in the text",
  ];
  return (
    <div className="flex h-full min-h-72 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white/60 p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
        <Lightbulb size={28} aria-hidden="true" />
      </div>
      <h2 className="mt-4 font-semibold text-slate-900">Your result will appear here</h2>
      <p className="mt-1 text-sm text-slate-600">Paste a review and press Analyze review to see:</p>
      <ul className="mt-3 space-y-1 text-left text-sm text-slate-700">
        {tips.map((t) => (
          <li key={t} className="flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0 text-green-600" aria-hidden="true" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

function LoadingPanel() {
  return (
    <div role="status" aria-live="polite" className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3 text-slate-700">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600 motion-reduce:animate-none" />
        <span className="font-medium">Analyzing review...</span>
      </div>
      <div className="animate-pulse space-y-3 motion-reduce:animate-none">
        <div className="h-16 rounded-xl bg-slate-200" />
        <div className="h-3 rounded bg-slate-200" />
        <div className="h-24 rounded-xl bg-slate-100" />
        <div className="h-24 rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

export default function Analyze() {
  const { user } = useAuth();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const resultRef = useRef(null);

  useEffect(() => {
    if (!result || !resultRef.current || window.innerWidth >= 1024) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    resultRef.current.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, [result]);

  async function handleSubmit(review, rating) {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      setResult(await analyzeReview(review, rating));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setResult(null);
    setError("");
  }

  return (
    <div>
      <section
        className="text-white"
        style={{ background: "linear-gradient(135deg, #312e81, #4f46e5 60%, #7c3aed)" }}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-8">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <ScanSearch size={26} aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Analyze a Review</h1>
            <p className="text-sm text-indigo-100">
              Paste a product review to see how the model and the warning-sign checks assess it.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-4 px-4 py-8">
        {!user && (
          <p className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-900">
            <LogIn size={16} aria-hidden="true" />
            <span>
              <Link to="/login" className="font-medium underline">Log in</Link> to save your analyses to your history.
            </span>
          </p>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-2">
          <ReviewForm onSubmit={handleSubmit} loading={loading} onClear={handleClear} />

          <div ref={resultRef} className="scroll-mt-4">
            {loading && <LoadingPanel />}

            {!loading && error && (
              <p role="alert" className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
                <AlertCircle size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
                {error}
              </p>
            )}

            {!loading && !error && !result && <EmptyState />}

            {!loading && result && (
              <div className="space-y-3">
                <ResultCard result={result} />
                {user && (
                  <p className="flex items-center gap-2 text-sm text-slate-600">
                    {result.saved ? (
                      <>
                        <CheckCircle2 size={16} className="text-green-600" aria-hidden="true" />
                        <span>
                          Saved to your <Link to="/history" className="text-indigo-700 underline">history</Link>.
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={16} className="text-amber-600" aria-hidden="true" />
                        This result could not be saved to your history.
                      </>
                    )}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}