import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-slate-900 text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link to="/" className="text-xl font-bold">ReviewGuard AI</Link>
        <div className="flex flex-wrap gap-4 text-sm">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/analyze" className="hover:underline">Analyze</Link>
          <Link to="/dashboard" className="hover:underline">Dashboard</Link>
          <Link to="/about" className="hover:underline">About</Link>
          <Link to="/login" className="hover:underline">Login</Link>
          <Link to="/register" className="rounded bg-indigo-600 px-3 py-1 hover:bg-indigo-700">Register</Link>
        </div>
      </div>
    </nav>
  );
}