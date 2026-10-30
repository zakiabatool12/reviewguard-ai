import { useState } from "react";
import { Link } from "react-router-dom";
import FormField from "../components/FormField";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [info, setInfo] = useState("");

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function submit(e) {
    e.preventDefault();
    const errs = {};
    if (form.name.trim().length < 2) errs.name = "Enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Enter a valid email address.";
    if (form.password.length < 8) errs.password = "Password must be at least 8 characters.";
    if (form.confirm !== form.password) errs.confirm = "Passwords do not match.";
    setErrors(errs);
    setInfo("");
    if (Object.keys(errs).length === 0) {
      setInfo("Form is valid. Account creation will be connected to the backend on Day 5.");
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
        {info && <p className="rounded bg-indigo-50 p-2 text-sm text-indigo-900">{info}</p>}
        <button type="submit" className="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-700">
          Register
        </button>
        <p className="text-center text-sm text-slate-600">
          Already registered? <Link to="/login" className="text-indigo-700 underline">Log in</Link>
        </p>
      </form>
    </div>
  );
}