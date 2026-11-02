import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Layers,
  ShieldCheck,
  ShieldAlert,
  Activity,
  ScanSearch,
  History,
  ArrowRight,
} from "lucide-react";
import StatCard from "../components/StatCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { getDashboard } from "../services/api";

function localKey(d) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function lastSevenDays(daily) {
  const map = Object.fromEntries(daily.map((d) => [d.day, d.count]));
  const out = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = localKey(d);
    out.push({ day: key.slice(5), count: map[key] || 0 });
  }
  return out;
}

function QuickAction({ to, icon: Icon, title, text, chip }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${chip}`}>
        <Icon size={24} aria-hidden="true" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="text-sm text-slate-500">{text}</p>
      </div>
      <ArrowRight
        size={20}
        aria-hidden="true"
        className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-700 motion-reduce:group-hover:translate-x-0"
      />
    </Link>
  );
}

function LabelBadge({ label }) {
  const suspicious = label === "suspicious";
  const Icon = suspicious ? ShieldAlert : ShieldCheck;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
        suspicious ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"
      }`}
    >
      <Icon size={12} aria-hidden="true" />
      {suspicious ? "Suspicious" : "Genuine"}
    </span>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboard().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <p role="alert" className="rounded bg-red-50 p-3 text-red-800">{error}</p>;
  if (!data) return <LoadingSpinner />;

  const firstName = (user?.name || "").split(" ")[0];
  const pct = (n) => (data.total ? Math.round((n / data.total) * 100) : 0);
  const week = lastSevenDays(data.daily);
  const weekTotal = week.reduce((sum, d) => sum + d.count, 0);
  const pie = [
    { name: `Genuine-class (${data.genuine})`, value: data.genuine, color: "#16a34a" },
    { name: `Suspicious-class (${data.suspicious})`, value: data.suspicious, color: "#d97706" },
  ].filter((p) => p.value > 0);

  return (
    <div className="space-y-6">
      <div
        className="rounded-2xl p-6 text-white shadow"
        style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
      >
        <h1 className="text-2xl font-bold">Welcome back{firstName ? `, ${firstName}` : ""}</h1>
        <p className="mt-1 text-sm text-indigo-100">
          Here is a summary of the reviews you have analyzed.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total reviews analyzed" value={data.total} icon={Layers} color="indigo" />
        <StatCard title="Genuine-class predictions" value={data.genuine} note={`${pct(data.genuine)}% of total`} icon={ShieldCheck} color="green" />
        <StatCard title="Suspicious-class predictions" value={data.suspicious} note={`${pct(data.suspicious)}% of total`} icon={ShieldAlert} color="amber" />
        <StatCard title="Analyses this week" value={weekTotal} note="Last 7 days" icon={Activity} color="sky" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <QuickAction to="/analyze" icon={ScanSearch} title="Analyze a review" text="Check a new product review" chip="bg-indigo-100 text-indigo-600" />
        <QuickAction to="/history" icon={History} title="View history" text="Search and filter past analyses" chip="bg-sky-100 text-sky-600" />
      </div>

      {data.total === 0 ? (
        <p className="rounded-xl bg-white p-5 text-slate-600 shadow">
          No analyses yet. <Link to="/analyze" className="text-indigo-700 underline">Analyze your first review</Link> and your charts will appear here.
        </p>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:shadow-md">
              <h2 className="mb-3 font-semibold">Prediction distribution</h2>
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pie} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                      {pie.map((p) => (
                        <Cell key={p.name} fill={p.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:shadow-md">
              <h2 className="mb-3 font-semibold">Analyses in the last 7 days</h2>
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={week}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" name="Analyses" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 font-semibold">Recent activity</h2>
            <ul className="divide-y text-sm">
              {data.recent.map((h) => (
                <li key={h.id}>
                  <Link
                    to={`/history/${h.id}`}
                    className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-2 transition hover:bg-slate-50"
                  >
                    <span className="truncate text-slate-800">{h.preview}</span>
                    <span className="flex shrink-0 items-center gap-3">
                      <LabelBadge label={h.label} />
                      <span className="text-xs text-slate-500">{new Date(h.created_at).toLocaleDateString()}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}