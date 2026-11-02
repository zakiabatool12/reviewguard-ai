import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <nav className="bg-slate-900 text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link to="/" className="text-xl font-bold">ReviewGuard AI</Link>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/analyze" className="hover:underline">Analyze</Link>
          <Link to="/about" className="hover:underline">About</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="hover:underline">Dashboard</Link>
              <Link to="/history" className="hover:underline">History</Link>
              <span className="text-slate-300">{user.name}</span>
              <button onClick={handleLogout} className="rounded bg-slate-700 px-3 py-1 hover:bg-slate-600">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">Login</Link>
              <Link to="/register" className="rounded bg-indigo-600 px-3 py-1 hover:bg-indigo-700">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}