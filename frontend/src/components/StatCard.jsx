const COLORS = {
  indigo: "bg-indigo-100 text-indigo-600",
  green: "bg-green-100 text-green-600",
  amber: "bg-amber-100 text-amber-600",
  sky: "bg-sky-100 text-sky-600",
  rose: "bg-rose-100 text-rose-600",
};

export default function StatCard({ title, value, note, icon: Icon, color = "indigo" }) {
  const chip = COLORS[color] || COLORS.indigo;

  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 ease-out hover:-translate-y-1 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        {Icon && (
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition duration-200 group-hover:scale-110 motion-reduce:group-hover:scale-100 ${chip}`}
          >
            <Icon size={22} aria-hidden="true" />
          </div>
        )}
      </div>
      {note && <p className="mt-2 text-xs text-slate-500">{note}</p>}
    </div>
  );
}