import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormField from "../components/FormField";
import { register } from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    if (loading) return;
    const errs = {};
    if (form.name.trim().length < 2) errs.name = "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Enter a valid email address.";
    if (form.password.length < 8) errs.password = "Password must be at least 8 characters.";
    if (form.confirm !== form.password) errs.confirm = "Passwords do not match.";
    setErrors(errs);
    setServerError("");
    if (Object.keys(errs).length) return;

    setLoading(true);
    const email = form.email.trim().toLowerCase();
    try {
      await register(form);
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      if (err.status === 502) {
        // account exists but the email failed: user can press "Resend code"
        navigate(`/verify-email?email=${encodeURIComponent(email)}`, {
          state: { notice: err.message },
        });
      } else {
        setServerError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <form onSubmit={submit} noValidate className="space-y-4 rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">Create an account</h1>
        <FormField label="Name" name="name" value={form.name} onChange={change} error={errors.name} />
        <FormField label="Email" name="email" type="email" value={form.email} onChange={change} error={errors.email} />
        <FormField label="Password" name="password" type="password" value={form.password} onChange={change} error={errors.password} />
        <FormField label="Confirm password" name="confirm" type="password" value={form.confirm} onChange={change} error={errors.confirm} />
        {serverError && <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-800">{serverError}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Register"}
        </button>
        <p className="text-center text-sm text-slate-600">
          Already registered? <Link to="/login" className="text-indigo-700 underline">Log in</Link>
        </p>
      </form>
    </div>
  );
}