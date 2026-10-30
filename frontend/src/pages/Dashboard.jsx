import { Link } from "react-router-dom";
import StatCard from "../components/StatCard";
import { demoHistory } from "../data/demoData";

export default function Dashboard() {
  const total = demoHistory.length;
  const genuine = demoHistory.filter((h) => h.label === "genuine").length;
  const suspicious = total - genuine;
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);
  const recent = [...demoHistory].reverse().slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link to="/analyze" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          New analysis
        </Link>
      </div>
      <p className="rounded bg-amber-50 p-2 text-xs text-amber-900">
        Demo data shown. Real statistics will come from your saved analyses (Day 5-6).
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total reviews analyzed" value={total} />
        <StatCard title="Genuine-class predictions" value={genuine} note={`${pct(genuine)}% of total`} />
        <StatCard title="Suspicious-class predictions" value={suspicious} note={`${pct(suspicious)}% of total`} />
      </div>

      <div className="rounded-xl bg-white p-5 shadow">
        <h2 className="mb-3 font-semibold">Prediction distribution</h2>
        {[
          { name: "Genuine-class", n: genuine, color: "bg-green-600" },
          { name: "Suspicious-class", n: suspicious, color: "bg-amber-500" },
        ].map((r) => (
          <div key={r.name} className="mb-3">
            <div className="mb-1 flex justify-between text-sm">
              <span>{r.name}</span>
              <span>{r.n} ({pct(r.n)}%)</span>
            </div>
            <div className="h-3 w-full rounded bg-slate-200">
              <div className={`h-3 rounded ${r.color}`} style={{ width: `${pct(r.n)}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-white p-5 shadow">
        <h2 className="mb-3 font-semibold">Recent activity</h2>
        <ul className="divide-y text-sm">
          {recent.map((h) => (
            <li key={h.id} className="flex items-center justify-between gap-3 py-2">
              <span className="truncate">{h.text}</span>
              <span className="shrink-0 text-xs text-slate-500">{h.label} - {h.date}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}