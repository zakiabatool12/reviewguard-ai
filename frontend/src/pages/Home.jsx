import { Link } from "react-router-dom";

const features = [
  { icon: "\uD83E\uDD16", title: "ML Detection", text: "TF-IDF + Logistic Regression classifier trained on labelled reviews." },
  { icon: "\uD83D\uDD0D", title: "Warning Signs", text: "Rule-based checks for repeated punctuation, promo language and rating mismatch." },
  { icon: "\uD83D\uDCCA", title: "Honest Scores", text: "Shows model confidence, not a final verdict on fraud." },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <section className="text-center">
        <h1 className="text-4xl font-extrabold text-slate-900">Spot suspicious product reviews</h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-600">
          Fake reviews mislead buyers. ReviewGuard AI analyzes a review's text and shows
          whether it resembles suspicious examples, and why.
        </p>
        <Link
          to="/analyze"
          className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700"
        >
          Start Analyzing
        </Link>
      </section>

      <section className="mt-12 grid gap-6 md:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="rounded-xl bg-white p-6 shadow">
            <div className="text-3xl" aria-hidden="true">{f.icon}</div>
            <h3 className="mt-2 font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{f.text}</p>
          </div>
        ))}
      </section>

      <p className="mt-10 text-center text-xs text-slate-500">
        Disclaimer: predictions can be wrong and are not proof of fraud.
      </p>
    </div>
  );
}