import { useState } from "react";
import { API_BASE } from "./api.js";
import Logo from "./components/Logo.jsx";

export default function Signup({ onLogin, onGoLogin }) {
  const [form,    setForm]    = useState({ username: "", password: "", confirm: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const { username, password, confirm } = form;

    if (!username.trim() || !password || !confirm) {
      setError("All fields are required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter.");
      return;
    }
    if (!/[a-z]/.test(password)) {
      setError("Password must contain at least one lowercase letter.");
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res  = await fetch(`${API_BASE}/auth/signup`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Signup failed. Please try again.");
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

  const field = (key) => ({
    value:     form[key],
    onChange:  (e) => { setForm({ ...form, [key]: e.target.value }); setError(""); },
    onKeyDown: (e) => e.key === "Enter" && submit(),
  });

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
          Join thousands of students staying on top of their academics.
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

          <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">Create account</h2>
          <p className="text-sm text-gray-400 mb-7">Free forever. No credit card needed.</p>

          {/* Username */}
          <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Username</label>
          <input
            type="text"
            {...field("username")}
            placeholder="Choose a username"
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm mb-4 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition bg-gray-50/50"
            autoFocus
          />

          {/* Password */}
          <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Password</label>
          <input
            type="password"
            {...field("password")}
            placeholder="8+ chars, A-Z, a-z, 0-9"
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm mb-4 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition bg-gray-50/50"
          />

          {/* Confirm password */}
          <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Confirm Password</label>
          <input
            type="password"
            {...field("confirm")}
            placeholder="Re-enter your password"
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
            {loading ? "Creating account…" : "Create Account"}
          </button>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <button onClick={onGoLogin} className="text-indigo-600 font-semibold hover:underline">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
