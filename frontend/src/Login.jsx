import { useState } from "react";
import { API_BASE } from "./api.js";
import Logo from "./components/Logo.jsx";

const GOOGLE_AUTH_URL = `${API_BASE}/oauth2/authorization/google`;

export default function Login({ onLogin, onGoSignup }) {
  const [form,    setForm]    = useState({ username: "", password: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!form.username.trim() || !form.password) {
      setError("Both fields are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res  = await fetch(`${API_BASE}/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ username: form.username.trim(), password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed. Please try again.");
      } else {
        localStorage.setItem("token",        data.token);
        localStorage.setItem("refreshToken", data.refreshToken);
        onLogin();
      }
    } catch {
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div
        className="hidden lg:flex flex-col justify-center items-center w-1/2 p-12"
        style={{ background: "linear-gradient(160deg,#312e81 0%,#4c1d95 60%,#6d28d9 100%)" }}
      >
        <Logo size={72} />
        <h1 className="text-4xl font-bold text-white mt-6 tracking-tight">StudentBuddy</h1>
        <p className="text-indigo-200 text-base mt-3 text-center max-w-xs leading-relaxed">
          Your all-in-one academic companion for tasks, goals, timetables, and more.
        </p>
        <div className="flex gap-2 mt-8">
          {["Tasks", "Goals", "Timetable", "Assistant"].map(f => (
            <span
              key={f}
              className="text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "#c7d2fe" }}
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center bg-[#f8fafc] px-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-6 lg:hidden">
            <Logo size={36} />
            <span className="text-lg font-bold text-gray-900">StudentBuddy</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">Welcome back</h2>
          <p className="text-sm text-gray-400 mb-7">Sign in to your account</p>

          {/* Username */}
          <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Username</label>
          <input
            type="text"
            value={form.username}
            onChange={(e) => { setForm({ ...form, username: e.target.value }); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Enter your username"
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm mb-4 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition bg-gray-50/50"
            autoFocus
          />

          {/* Password */}
          <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => { setForm({ ...form, password: e.target.value }); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Enter your password"
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm mb-2 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition bg-gray-50/50"
          />

          {error ? <p className="text-red-500 text-xs mb-4">{error}</p> : <div className="mb-4" />}

          {/* Submit */}
          <button
            onClick={submit}
            disabled={loading}
            className="w-full py-2.5 rounded-xl font-bold text-sm text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)", boxShadow: "0 4px 14px rgba(99,102,241,0.35)" }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <hr className="flex-1 border-gray-100" />
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <hr className="flex-1 border-gray-100" />
          </div>

          {/* Google OAuth2 */}
          <a
            href={GOOGLE_AUTH_URL}
            className="w-full flex items-center justify-center gap-2.5 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition bg-white"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </a>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{" "}
            <button onClick={onGoSignup} className="text-indigo-600 font-semibold hover:underline">
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
