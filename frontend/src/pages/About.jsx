export default function About() {
  const stack = [
    ["Frontend", "React + Vite, Tailwind CSS"],
    ["Backend", "Python Flask REST API"],
    ["Machine learning", "scikit-learn: TF-IDF + Logistic Regression"],
    ["Database", "MySQL"],
  ];
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <h1 className="text-3xl font-bold">About ReviewGuard AI</h1>
      <p className="text-slate-700">
        ReviewGuard AI checks how closely a product review resembles the suspicious or
        genuine examples the model was trained on, and lists simple warning signs found
        in the text.
      </p>

      <section className="rounded-xl bg-white p-6 shadow">
        <h2 className="mb-2 font-semibold">Technology</h2>
        <ul className="space-y-1 text-sm">
          {stack.map(([k, v]) => (
            <li key={k}><span className="font-medium">{k}:</span> {v}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl bg-white p-6 shadow">
        <h2 className="mb-2 font-semibold">Limitations</h2>
        <ul className="list-disc pl-5 text-sm text-slate-700">
          <li>Predictions can be wrong; a result is not proof that a review is fake.</li>
          <li>The confidence value is a model score, not a calibrated probability.</li>
          <li>The model reflects the dataset it was trained on and its label definitions.</li>
          <li>The first version supports English reviews only.</li>
        </ul>
      </section>
    </div>
  );
}