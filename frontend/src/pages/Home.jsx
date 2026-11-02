import { Link } from "react-router-dom";
import {
  ShieldCheck,
  ShieldAlert,
  ScanSearch,
  Brain,
  Lock,
  History,
  ArrowRight,
  ClipboardPaste,
  Cpu,
  ListChecks,
  Sparkles,
  Activity,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const features = [
  {
    icon: Brain,
    chip: "bg-indigo-100 text-indigo-600",
    title: "Machine learning detection",
    text: "A TF-IDF and Logistic Regression model checks how closely a review resembles the suspicious examples it was trained on.",
  },
  {
    icon: ListChecks,
    chip: "bg-amber-100 text-amber-600",
    title: "Clear warning signs",
    text: "Rule-based checks flag repeated punctuation, promotional wording, very short reviews and rating mismatches.",
  },
  {
    icon: Sparkles,
    chip: "bg-purple-100 text-purple-600",
    title: "Explainable results",
    text: "See which words influenced the model, shown separately from the rule-based signals.",
  },
  {
    icon: History,
    chip: "bg-sky-100 text-sky-600",
    title: "Saved history",
    text: "Every analysis is saved to your account. Search, filter by date or class, and delete any time.",
  },
  {
    icon: Activity,
    chip: "bg-green-100 text-green-600",
    title: "Dashboard insights",
    text: "Track how many reviews you analyzed and how the predictions are distributed over time.",
  },
  {
    icon: Lock,
    chip: "bg-rose-100 text-rose-600",
    title: "Secure accounts",
    text: "Email OTP verification, hashed passwords and private records that only you can open.",
  },
];

const steps = [
  {
    icon: ClipboardPaste,
    title: "Paste a review",
    text: "Add the review text and, if you like, its star rating.",
  },
  {
    icon: Cpu,
    title: "Run the analysis",
    text: "The model and the rule-based checks inspect the text in a moment.",
  },
  {
    icon: ShieldCheck,
    title: "Read the result",
    text: "Review the prediction, influential words and warning signs, then decide for yourself.",
  },
];

function ExampleCard() {
  return (
    <div className="rounded-2xl bg-white p-5 text-slate-900 shadow-2xl ring-1 ring-black/5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">Review Analysis</h2>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
          Illustrative example
        </span>
      </div>

      <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
        Amazing!!! Best ever, everyone must buy this now!!!
      </p>

      <div className="mt-3 flex items-center gap-3 rounded-lg border-2 border-amber-500 bg-amber-50 p-3">
        <ShieldAlert size={28} className="text-amber-600" aria-hidden="true" />
        <div>
          <p className="font-semibold">Suspicious-style review</p>
          <p className="text-xs text-slate-600">Shown for demonstration, not a real result</p>
        </div>
      </div>

      <div className="mt-3">
        <p className="text-xs font-medium text-slate-500">Possible warning signs</p>
        <ul className="mt-1 list-disc pl-5 text-sm text-slate-700">
          <li>Repeated punctuation found</li>
          <li>Promotional wording</li>
        </ul>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {["best", "buy now", "amazing"].map((w) => (
          <span key={w} className="rounded-full border border-slate-300 bg-slate-50 px-3 py-0.5 text-xs">
            {w}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section
        className="relative overflow-hidden text-white"
        style={{ background: "linear-gradient(135deg, #312e81, #4f46e5 55%, #7c3aed)" }}
      >
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-purple-400/20 blur-3xl" aria-hidden="true" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:py-20 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm">
              <ShieldCheck size={16} aria-hidden="true" />
              AI-assisted review checking
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl">
              Spot suspicious product reviews before they mislead you
            </h1>
            <p className="mt-4 max-w-xl text-lg text-indigo-100">
              ReviewGuard AI studies the wording of a review, highlights possible warning signs and
              shows why the model reached its result.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/analyze"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-indigo-700 shadow transition hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <ScanSearch size={20} aria-hidden="true" />
                Start analyzing
              </Link>
              {user ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/60 px-6 py-3 font-semibold transition hover:bg-white/10"
                >
                  Go to dashboard
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/60 px-6 py-3 font-semibold transition hover:bg-white/10"
                >
                  Create a free account
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              )}
            </div>

            <p className="mt-4 text-sm text-indigo-200">
              Predictions can be wrong and are not proof of fraud.
            </p>
          </div>

          <ExampleCard />
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900">Everything you need to check a review</h2>
          <p className="mx-auto mt-2 max-w-2xl text-slate-600">
            From a quick analysis to a saved history with charts, all in one place.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, chip, title, text }) => (
            <div
              key={title}
              className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl transition duration-200 group-hover:scale-110 motion-reduce:group-hover:scale-100 ${chip}`}
              >
                <Icon size={24} aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold text-slate-900">How it works</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <div key={title} className="text-center">
                <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg">
                  <Icon size={28} aria-hidden="true" />
                  <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-slate-900">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
                <p className="mx-auto mt-1 max-w-xs text-sm text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div
          className="rounded-2xl p-10 text-center text-white shadow"
          style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
        >
          <h2 className="text-3xl font-bold">Ready to check your first review?</h2>
          <p className="mx-auto mt-2 max-w-xl text-indigo-100">
            Try it without an account, or sign up to keep a history of your analyses.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/analyze"
              className="rounded-lg bg-white px-6 py-3 font-semibold text-indigo-700 transition hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              Analyze a review
            </Link>
            {!user && (
              <Link
                to="/register"
                className="rounded-lg border border-white/60 px-6 py-3 font-semibold transition hover:bg-white/10"
              >
                Sign up
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-slate-600 md:flex-row">
          <p>ReviewGuard AI - a student portfolio project</p>
          <p className="text-center text-xs text-slate-500">
            Results show similarity to the training data and are not proof that a review is fake.
          </p>
          <div className="flex gap-4">
            <Link to="/about" className="hover:underline">About</Link>
            <Link to="/analyze" className="hover:underline">Analyze</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}