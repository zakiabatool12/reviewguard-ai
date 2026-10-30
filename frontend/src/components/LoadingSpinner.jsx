export default function LoadingSpinner() {
  return (
    <div role="status" className="flex items-center gap-2 text-slate-600">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
      <span>Analyzing review...</span>
    </div>
  );
}