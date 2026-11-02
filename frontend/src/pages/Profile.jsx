import { useState } from "react";
import FormField from "../components/FormField";
import { useAuth } from "../context/AuthContext";
import { updateProfile, changePassword, deleteAllHistory } from "../services/api";

function Msg({ m }) {
  if (!m.text) return null;
  const style = m.type === "error" ? "bg-red-50 text-red-800" : "bg-green-50 text-green-900";
  return <p role={m.type === "error" ? "alert" : "status"} className={`rounded p-2 text-sm ${style}`}>{m.text}</p>;
}

export default function Profile() {
  const { user, setUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [nameMsg, setNameMsg] = useState({ type: "", text: "" });
  const [savingName, setSavingName] = useState(false);

  const [pw, setPw] = useState({ current_password: "", new_password: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState({ type: "", text: "" });
  const [savingPw, setSavingPw] = useState(false);

  const [dataMsg, setDataMsg] = useState({ type: "", text: "" });

  async function saveName(e) {
    e.preventDefault();
    if (savingName) return;
    if (name.trim().length < 2) {
      return setNameMsg({ type: "error", text: "Name must be at least 2 characters." });
    }
    setSavingName(true);
    try {
      const res = await updateProfile(name.trim());
      setUser(res.user);
      setNameMsg({ type: "ok", text: "Name updated." });
    } catch (err) {
      setNameMsg({ type: "error", text: err.message });
    } finally {
      setSavingName(false);
    }
  }

  async function savePassword(e) {
    e.preventDefault();
    if (savingPw) return;
    if (!pw.current_password) return setPwMsg({ type: "error", text: "Enter your current password." });
    if (pw.new_password.length < 8) return setPwMsg({ type: "error", text: "New password must be at least 8 characters." });
    if (pw.new_password !== pw.confirm) return setPwMsg({ type: "error", text: "New passwords do not match." });
    setSavingPw(true);
    try {
      await changePassword(pw);
      setPw({ current_password: "", new_password: "", confirm: "" });
      setPwMsg({ type: "ok", text: "Password changed." });
    } catch (err) {
      setPwMsg({ type: "error", text: err.message });
    } finally {
      setSavingPw(false);
    }
  }

  async function clearHistory() {
    if (!window.confirm("Delete ALL your saved analyses? This cannot be undone.")) return;
    try {
      const res = await deleteAllHistory();
      setDataMsg({ type: "ok", text: `${res.deleted} analyses deleted.` });
    } catch (err) {
      setDataMsg({ type: "error", text: err.message });
    }
  }

  const onPw = (e) => setPw({ ...pw, [e.target.name]: e.target.value });

  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-2xl font-bold">Profile and Settings</h1>

      <form onSubmit={saveName} noValidate className="space-y-3 rounded-xl bg-white p-6 shadow">
        <h2 className="font-semibold">Account details</h2>
        <FormField label="Name" name="name" value={name} onChange={(e) => setName(e.target.value)} />
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <p className="rounded-lg bg-slate-100 p-2 text-slate-700">{user?.email}</p>
          <p className="mt-1 text-xs text-slate-500">Email cannot be changed yet.</p>
        </div>
        <Msg m={nameMsg} />
        <button type="submit" disabled={savingName} className="rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
          {savingName ? "Saving..." : "Save name"}
        </button>
      </form>

      <form onSubmit={savePassword} noValidate className="space-y-3 rounded-xl bg-white p-6 shadow">
        <h2 className="font-semibold">Change password</h2>
        <FormField label="Current password" name="current_password" type="password" value={pw.current_password} onChange={onPw} />
        <FormField label="New password" name="new_password" type="password" value={pw.new_password} onChange={onPw} />
        <FormField label="Confirm new password" name="confirm" type="password" value={pw.confirm} onChange={onPw} />
        <Msg m={pwMsg} />
        <button type="submit" disabled={savingPw} className="rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
          {savingPw ? "Changing..." : "Change password"}
        </button>
      </form>

      <div className="space-y-3 rounded-xl bg-white p-6 shadow">
        <h2 className="font-semibold">Your data</h2>
        <p className="text-sm text-slate-600">
          Your analyzed reviews are stored in your history. You can delete them at any time.
        </p>
        <Msg m={dataMsg} />
        <button onClick={clearHistory} className="rounded-lg border border-red-600 px-5 py-2 font-medium text-red-700 hover:bg-red-50">
          Delete all my analyses
        </button>
      </div>
    </div>
  );
}