import { ShieldCheck, ShieldAlert, Sparkles, ListChecks, Info, CheckCircle2 } from "lucide-react";

export default function ResultCard({ result }) {
  const suspicious = result.prediction === "suspicious";
  const percent = Math.round((result.confidence || 0) * 100);
  const signals = result.signals || [];
  const terms = result.terms || [];
  const Icon = suspicious ? ShieldAlert : ShieldCheck;

  return (
    <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Review Analysis</h2>

      <div
        className={`flex items-center gap-4 rounded-xl border-2 p-4 ${
          suspicious ? "border-amber-500 bg-amber-50" : "border-green-600 bg-green-50"
        }`}
      >
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${
            suspicious ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
          }`}
        >
          <Icon size={30} aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Predicted class</p>
          <p className="text-xl font-bold text-slate-900">
            {suspicious ? "Suspicious-style review" : "Genuine-style review"}
          </p>
        </div>
      </div>

      <div>
        <div className="mb-1 flex items-end justify-between">
          <span className="text-sm font-medium text-slate-800">Model confidence</span>
          <span className="text-2xl font-bold text-slate-900">{percent}%</span>
        </div>
        <div
          role="progressbar"
          aria-label="Model confidence"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-3 w-full overflow-hidden rounded-full bg-slate-200"
        >
          <div
            className={`h-3 rounded-full ${suspicious ? "bg-amber-500" : "bg-green-600"}`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-slate-500">A model score, not a calibrated probability.</p>
      </div>

      <div className="rounded-xl bg-slate-50 p-4">
        <h3 className="flex items-center gap-2 font-medium text-slate-900">
          <Sparkles size={18} className="text-purple-600" aria-hidden="true" />
          Words that influenced the model
        </h3>
        <p className="text-xs text-slate-500">Model explanation: terms that pushed the classifier toward this result.</p>
        {terms.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">No influential words available for this review.</p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            {terms.map((t) => (
              <span key={t.term} className="rounded-full border border-purple-200 bg-white px-3 py-1 text-sm text-purple-800">
                {t.term}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl bg-slate-50 p-4">
        <h3 className="flex items-center gap-2 font-medium text-slate-900">
          <ListChecks size={18} className="text-amber-600" aria-hidden="true" />
          Possible warning signs
        </h3>
        <p className="text-xs text-slate-500">Rule-based checks on the text. They are independent of the model.</p>
        {signals.length === 0 ? (
          <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
            <CheckCircle2 size={16} className="text-green-600" aria-hidden="true" />
            No rule-based warning signs detected.
          </p>
        ) : (
          <ul className="mt-2 space-y-1">
            {signals.map((s) => (
              <li key={s.type} className="flex items-start gap-2 text-sm text-slate-700">
                <Info size={16} className="mt-0.5 shrink-0 text-amber-600" aria-hidden="true" />
                {s.message}
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="flex items-start gap-2 rounded-lg bg-slate-100 p-3 text-xs text-slate-600">
        <Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
        This result shows how much the review resembles the examples the model was trained on.
        It is not proof that a review is fake.
      </p>
    </div>
  );
}