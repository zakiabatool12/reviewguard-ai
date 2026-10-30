export default function ResultCard({ result }) {
  const suspicious = result.prediction === "suspicious";
  const percent = Math.round(result.confidence * 100);

  return (
    <div className="space-y-4 rounded-xl bg-white p-6 shadow">
      <h2 className="text-lg font-semibold">Review Analysis</h2>

      <div
        className={`flex items-center gap-3 rounded-lg border-2 p-4 ${
          suspicious ? "border-amber-500 bg-amber-50" : "border-green-600 bg-green-50"
        }`}
      >
        <span className="text-3xl" aria-hidden="true">
          {suspicious ? "\u26A0\uFE0F" : "\u2705"}
        </span>
        <div>
          <p className="text-xl font-bold capitalize">
            Predicted: {suspicious ? "Suspicious-style review" : "Genuine-style review"}
          </p>
          <p className="text-sm text-slate-700">Model confidence: {percent}%</p>
        </div>
      </div>

      <div>
        <h3 className="font-medium">Possible warning signs (rule-based)</h3>
        {result.signals.length === 0 ? (
          <p className="text-sm text-slate-600">No rule-based warning signs detected.</p>
        ) : (
          <ul className="list-disc pl-5 text-sm text-slate-700">
            {result.signals.map((s) => (
              <li key={s.type}>{s.message}</li>
            ))}
          </ul>
        )}
      </div>

      <p className="rounded bg-slate-100 p-3 text-xs text-slate-600">
        This result shows how much the review resembles the examples the model was trained
        on. It is not proof that a review is fake, and the confidence score is not a
        calibrated probability.
      </p>
    </div>
  );
}