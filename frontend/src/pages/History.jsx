import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import { getHistory, deleteHistory } from "../services/api";

export default function History() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [label, setLabel] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState("");
  const [fromInput, setFromInput] = useState("");
  const [toInput, setToInput] = useState("");
  const [dates, setDates] = useState({ from: "", to: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(
        await getHistory({ page, label, q, date_from: dates.from, date_to: dates.to })
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, label, q, dates]);

  useEffect(() => {
    load();
  }, [load]);

  function applyFilters(e) {
    e.preventDefault();
    if (fromInput && toInput && fromInput > toInput) {
      return setError("The start date must be before the end date.");
    }
    setPage(1);
    setQ(searchInput.trim());
    setDates({ from: fromInput, to: toInput });
  }

  function clearFilters() {
    setSearchInput("");
    setFromInput("");
    setToInput("");
    setLabel("");
    setQ("");
    setDates({ from: "", to: "" });
    setPage(1);
  }

  async function remove(id) {
    if (!window.confirm("Delete this analysis? This cannot be undone.")) return;
    try {
      await deleteHistory(id);
      if (data && data.items.length === 1 && page > 1) setPage(page - 1);
      else load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Analysis History</h1>

      <form onSubmit={applyFilters} className="space-y-3 rounded-xl bg-white p-4 shadow">
        <div className="flex flex-wrap gap-3">
          <input
            type="search"
            aria-label="Search reviews"
            placeholder="Search review text..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="min-w-60 flex-1 rounded-lg border border-slate-300 p-2"
          />
          <select
            aria-label="Filter by predicted class"
            value={label}
            onChange={(e) => { setPage(1); setLabel(e.target.value); }}
            className="rounded-lg border border-slate-300 p-2"
          >
            <option value="">All classes</option>
            <option value="genuine">Genuine-class</option>
            <option value="suspicious">Suspicious-class</option>
          </select>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm">
            From
            <input type="date" value={fromInput} onChange={(e) => setFromInput(e.target.value)} className="ml-2 rounded-lg border border-slate-300 p-2" />
          </label>
          <label className="text-sm">
            To
            <input type="date" value={toInput} onChange={(e) => setToInput(e.target.value)} className="ml-2 rounded-lg border border-slate-300 p-2" />
          </label>
          <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">Apply</button>
          <button type="button" onClick={clearFilters} className="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-50">Clear</button>
        </div>
      </form>

      {error && <p role="alert" className="rounded bg-red-50 p-3 text-red-800">{error}</p>}
      {loading && <LoadingSpinner />}

      {data && (
        <>
          <div className="overflow-x-auto rounded-xl bg-white shadow">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="p-3">Review</th>
                  <th className="p-3">Predicted</th>
                  <th className="p-3">Confidence</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.items.length === 0 && (
                  <tr><td colSpan="5" className="p-4 text-center text-slate-500">No matching records.</td></tr>
                )}
                {data.items.map((h) => (
                  <tr key={h.id} className="border-t">
                    <td className="max-w-xs truncate p-3">{h.preview}</td>
                    <td className="p-3 capitalize">{h.label}</td>
                    <td className="p-3">{Math.round(h.confidence * 100)}%</td>
                    <td className="p-3">{new Date(h.created_at).toLocaleDateString()}</td>
                    <td className="space-x-3 p-3">
                      <Link to={`/history/${h.id}`} className="text-indigo-700 underline">View</Link>
                      <button onClick={() => remove(h.id)} className="text-red-700 underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">{data.total} records - page {data.page} of {data.pages}</span>
            <div className="space-x-2">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded border border-slate-300 px-3 py-1 disabled:opacity-40">Previous</button>
              <button disabled={page >= data.pages} onClick={() => setPage(page + 1)} className="rounded border border-slate-300 px-3 py-1 disabled:opacity-40">Next</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}