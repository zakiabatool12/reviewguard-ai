import { useState } from "react";
import { demoHistory } from "../data/demoData";

export default function History() {
  const [items, setItems] = useState(demoHistory);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const shown = items.filter(
    (h) =>
      (filter === "all" || h.label === filter) &&
      h.text.toLowerCase().includes(query.toLowerCase())
  );

  function remove(id) {
    if (window.confirm("Delete this analysis?")) {
      setItems(items.filter((h) => h.id !== id));
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Analysis History</h1>
      <p className="rounded bg-amber-50 p-2 text-xs text-amber-900">
        Demo data shown. Saved history from the database will be connected on Day 5.
      </p>

      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          aria-label="Search reviews"
          placeholder="Search review text..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-w-60 flex-1 rounded-lg border border-slate-300 p-2"
        />
        <select
          aria-label="Filter by predicted class"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-slate-300 p-2"
        >
          <option value="all">All classes</option>
          <option value="genuine">Genuine-class</option>
          <option value="suspicious">Suspicious-class</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="p-3">Review</th>
              <th className="p-3">Predicted</th>
              <th className="p-3">Confidence</th>
              <th className="p-3">Date</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 && (
              <tr><td colSpan="5" className="p-4 text-center text-slate-500">No matching records.</td></tr>
            )}
            {shown.map((h) => (
              <tr key={h.id} className="border-t">
                <td className="max-w-xs truncate p-3">{h.text}</td>
                <td className="p-3 capitalize">{h.label}</td>
                <td className="p-3">{Math.round(h.confidence * 100)}%</td>
                <td className="p-3">{h.date}</td>
                <td className="p-3">
                  <button onClick={() => remove(h.id)} className="text-red-700 underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}