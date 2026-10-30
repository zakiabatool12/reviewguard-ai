import { useState } from "react";
import FormField from "../components/FormField";

export default function Profile() {
  const [form, setForm] = useState({ name: "", email: "" });
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
    setErrors(errs);
    setInfo("");
    if (Object.keys(errs).length === 0) {
      setInfo("Form is valid. Saving profile will be connected on Day 5.");
    }
  }

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-2xl font-bold">Profile and Settings</h1>
      <form onSubmit={submit} noValidate className="space-y-4 rounded-xl bg-white p-6 shadow">
        <FormField label="Name" name="name" value={form.name} onChange={change} error={errors.name} />
        <FormField label="Email" name="email" type="email" value={form.email} onChange={change} error={errors.email} />
        {info && <p className="rounded bg-indigo-50 p-2 text-sm text-indigo-900">{info}</p>}
        <button type="submit" className="rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-700">
          Save changes
        </button>
      </form>
    </div>
  );
}