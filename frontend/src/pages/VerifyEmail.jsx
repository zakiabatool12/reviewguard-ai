import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import FormField from "../components/FormField";
import { verifyOtp, resendOtp } from "../services/api";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(params.get("email") || "");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState(location.state?.notice || "");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(location.state?.fromLogin ? 0 : 60);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function submit(e) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setInfo("");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address.");
    if (!/^\d{6}$/.test(otp)) return setError("Enter the 6-digit code from your email.");

    setLoading(true);
    try {
      await verifyOtp(email.trim().toLowerCase(), otp);
      navigate("/login", { state: { notice: "Email verified. Please log in." } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setError("");
    setInfo("");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address.");
    try {
      const res = await resendOtp(email.trim().toLowerCase());
      setInfo(res.message);
      setCooldown(60);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <form onSubmit={submit} noValidate className="space-y-4 rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold">Verify your email</h1>
        <p className="text-sm text-slate-600">
          We sent a 6-digit code to your email. It expires in 10 minutes. Check Spam if you cannot see it.
        </p>
        <FormField label="Email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div>
          <label htmlFor="otp" className="mb-1 block text-sm font-medium">Verification code</label>
          <input
            id="otp"
            inputMode="numeric"
            maxLength={6}
            autoComplete="one-time-code"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="123456"
            className="w-full rounded-lg border border-slate-300 p-2 text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        {error && <p role="alert" className="rounded bg-red-50 p-2 text-sm text-red-800">{error}</p>}
        {info && <p className="rounded bg-indigo-50 p-2 text-sm text-indigo-900">{info}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify email"}
        </button>
        <button
          type="button"
          onClick={resend}
          disabled={cooldown > 0}
          className="w-full rounded-lg border border-slate-300 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </button>
        <p className="text-center text-sm text-slate-600">
          <Link to="/login" className="text-indigo-700 underline">Back to login</Link>
        </p>
      </form>
    </div>
  );
}