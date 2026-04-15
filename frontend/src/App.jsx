import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  CheckSquare,
  Target,
  CalendarDays,
  Bot,
  LogOut,
} from "lucide-react";
import { API_BASE } from "./api.js";
import { connectReminders, decodeUserId } from "./websocket.js";
import Login             from "./Login.jsx";
import Signup            from "./Signup.jsx";
import DashboardView     from "./views/DashboardView.jsx";
import TasksView         from "./views/TasksView.jsx";
import GoalsView         from "./views/GoalsView.jsx";
import TimetableCalendar from "./views/TimetableCalendar.jsx";
import ChatView          from "./views/ChatView.jsx";
import ToastContainer    from "./components/ToastContainer.jsx";
import Logo              from "./components/Logo.jsx";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { key: "tasks",     label: "Tasks",     Icon: CheckSquare     },
  { key: "goals",     label: "Goals",     Icon: Target          },
  { key: "timetable", label: "Timetable", Icon: CalendarDays    },
  { key: "chat",      label: "Assistant", Icon: Bot             },
];

export default function App() {
  const [token,      setToken]      = useState(() => localStorage.getItem("token"));
  const [authPage,   setAuthPage]   = useState("login");
  const [activeView, setActiveView] = useState("dashboard");
  const [toasts,     setToasts]     = useState([]);

  // ── OAuth2 redirect token extraction ─────────────────────────────────────
  useEffect(() => {
    const params          = new URLSearchParams(window.location.search);
    const urlToken        = params.get("token");
    const urlRefreshToken = params.get("refreshToken");

    if (urlToken) {
      localStorage.setItem("token", urlToken);
      if (urlRefreshToken) localStorage.setItem("refreshToken", urlRefreshToken);
      window.history.replaceState({}, "", window.location.pathname);
      setToken(urlToken);
      setActiveView("dashboard");
    }
  }, []);

  // ── Real-time reminder WebSocket ──────────────────────────────────────────
  useEffect(() => {
    if (!token) return;

    const userId = decodeUserId(token);
    if (!userId) return;

    const disconnect = connectReminders(userId, token, (notification) => {
      setToasts((prev) => [
        ...prev,
        { ...notification, id: Math.random().toString(36).slice(2) },
      ]);
    });

    return disconnect;
  }, [token]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleLogin = () => {
    setToken(localStorage.getItem("token"));
    setActiveView("dashboard");
  };

  const handleLogout = () => {
    const refreshToken = localStorage.getItem("refreshToken");
    fetch(`${API_BASE}/auth/logout`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ refreshToken }),
    }).catch(() => {});

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setToken(null);
    setToasts([]);
    setAuthPage("login");
  };

  // ── Auth gate ─────────────────────────────────────────────────────────────
  if (!token) {
    return authPage === "signup"
      ? <Signup onLogin={handleLogin} onGoLogin={() => setAuthPage("login")} />
      : <Login  onLogin={handleLogin} onGoSignup={() => setAuthPage("signup")} />;
  }

  // ── Main app (authenticated) ──────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#f8fafc]">

      {/* ── Sidebar ── */}
      <div
        className="w-60 flex flex-col flex-shrink-0"
        style={{
          background:  "linear-gradient(180deg,#312e81 0%,#4c1d95 100%)",
          boxShadow:   "2px 0 16px rgba(0,0,0,0.15)",
        }}
      >
        {/* Brand */}
        <div className="px-5 pt-6 pb-5 flex items-center gap-3">
          <Logo size={36} />
          <div>
            <h1 className="text-[15px] font-bold text-white tracking-tight leading-none">StudentBuddy</h1>
            <p className="text-[11px] text-indigo-300 mt-0.5 leading-none">Academic companion</p>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-5 h-px bg-white/10 mb-3" />

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          {NAV_ITEMS.map(({ key, label, Icon }) => {
            const active = activeView === key;
            return (
              <button
                key={key}
                onClick={() => setActiveView(key)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                  active
                    ? "bg-white text-indigo-700 shadow-md shadow-black/10"
                    : "text-indigo-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon
                  size={17}
                  className={`flex-shrink-0 transition-colors ${
                    active ? "text-indigo-600" : "text-indigo-300 group-hover:text-white"
                  }`}
                />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="px-3 pb-5 pt-2">
          <div className="h-px bg-white/10 mb-3" />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-indigo-300 hover:bg-white/10 hover:text-white transition-all duration-150"
          >
            <LogOut size={16} className="flex-shrink-0" />
            Sign Out
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeView === "dashboard" && <DashboardView />}
        {activeView === "tasks"     && <TasksView />}
        {activeView === "goals"     && <GoalsView />}
        {activeView === "timetable" && <TimetableCalendar />}
        {activeView === "chat"      && <ChatView />}
      </div>

      {/* ── Toast notifications ── */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

    </div>
  );
}
