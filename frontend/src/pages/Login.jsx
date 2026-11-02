import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import FormField from "../components/FormField";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [needsVerify, setNeedsVerify] = useState(false);
  const [loading, setLoading] = useState(false);
  const notice = location.state?.notice;

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    if (loading) return;
    const errs = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Enter a valid email address.";
    if (!form.password) errs.password = "Password is required.";
    setErrors(errs);
    setServerError("");
    setNeedsVerify(false);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await login(form.email.trim().toLowerCase(), form.password);
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (err) {
      setServerError(err.message);
      if (err.code === "not_verified") setNeedsVerify(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <form onSubmit={submit} noValidate className="space-y-4 rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">Log in</h1>
        {notice && <p className="rounded bg-green-50 p-2 text-sm text-green-900">{notice}</p>}
        <FormField label="Email" name="email" type="email" value={form.email} onChange={change} error={errors.email} />
        <FormField label="Password" name="password" type="password" value={form.password} onChange={change} error={errors.password} />
        {serverError && <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-800">{serverError}</p>}
        {needsVerify && (
          <Link
            to={`/verify-email?email=${encodeURIComponent(form.email.trim().toLowerCase())}`}
            state={{ fromLogin: true }}
            className="block text-center text-sm text-indigo-700 underline"
          >
            Go to email verification
          </Link>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
        <p className="text-center text-sm text-slate-600">
          No account? <Link to="/register" className="text-indigo-700 underline">Register</Link>
        </p>
      </form>
    </div>
  );
}