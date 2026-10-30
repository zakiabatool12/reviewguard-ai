import { useState } from "react";
import { Link } from "react-router-dom";
import FormField from "../components/FormField";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [info, setInfo] = useState("");

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function submit(e) {
    e.preventDefault();
    const errs = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Enter a valid email address.";
    if (!form.password) errs.password = "Password is required.";
    setErrors(errs);
    setInfo("");
    if (Object.keys(errs).length === 0) {
      setInfo("Form is valid. Real login will be connected to the backend on Day 5.");
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <form onSubmit={submit} noValidate className="space-y-4 rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">Log in</h1>
        <FormField label="Email" name="email" type="email" value={form.email} onChange={change} error={errors.email} />
        <FormField label="Password" name="password" type="password" value={form.password} onChange={change} error={errors.password} />
        {info && <p className="rounded bg-indigo-50 p-2 text-sm text-indigo-900">{info}</p>}
        <button type="submit" className="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-700">
          Log in
        </button>
        <p className="text-center text-sm text-slate-600">
          No account? <Link to="/register" className="text-indigo-700 underline">Register</Link>
        </p>
      </form>
    </div>
  );
}