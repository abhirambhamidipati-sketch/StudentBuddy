import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  Target,
  TrendingUp,
  CalendarDays,
  AlertTriangle,
} from "lucide-react";
import { authFetch } from "../api.js";

const TODAY = new Date().toLocaleDateString("en-CA");

const DEFAULT_ANALYTICS = { taskCompletion: 0, goalProgress: 0, eventsToday: 0, missedEvents: 0 };

export default function DashboardView() {
  const [tasks,     setTasks]     = useState([]);
  const [goals,     setGoals]     = useState([]);
  const [events,    setEvents]    = useState([]);
  const [analytics, setAnalytics] = useState(DEFAULT_ANALYTICS);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  useEffect(() => {
    Promise.all([
      authFetch("/tasks").then((r) => r.json()),
      authFetch("/goals").then((r) => r.json()),
      authFetch("/events").then((r) => r.json()),
    ])
      .then(([t, g, e]) => {
        setTasks(t);
        setGoals(g);
        setEvents(e);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not reach the server. Make sure the backend is running.");
        setLoading(false);
      });
  }, []);

  const fetchAnalytics = useCallback(() => {
    authFetch("/analytics")
      .then((r) => r.json())
      .then((data) => setAnalytics(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchAnalytics();
    window.addEventListener("studentbuddy:data-changed", fetchAnalytics);
    return () => window.removeEventListener("studentbuddy:data-changed", fetchAnalytics);
  }, [fetchAnalytics]);

  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const pendingTasks   = tasks.filter((t) => t.status !== "done").length;
  const todayEvents    = events.filter((e) => e.date === TODAY);
  const recentTasks    = [...tasks].sort((a, b) => (b.id > a.id ? 1 : -1)).slice(0, 5);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f8fafc]">
        <p className="text-gray-400 text-sm animate-pulse">Loading dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f8fafc]">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md text-center">
          <p className="text-red-600 font-semibold">Connection error</p>
          <p className="text-red-400 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fafc]">

      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-4" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Dashboard</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
          })}
        </p>
      </div>

      <div className="p-6 space-y-8 max-w-6xl mx-auto">

        {/* ── Stat Cards ── */}
        <section>
          <SectionHeading>Overview</SectionHeading>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <StatCard label="Total Tasks"    value={tasks.length}                  icon={<Circle size={16} />}         color="indigo" />
            <StatCard label="Completed"      value={completedTasks}                icon={<CheckCircle2 size={16} />}   color="green"  />
            <StatCard label="Pending"        value={pendingTasks}                  icon={<Clock size={16} />}          color="red"    />
            <StatCard label="Goals"          value={goals.length}                  icon={<Target size={16} />}         color="purple" />
            <StatCard label="Avg Progress"   value={`${analytics.goalProgress}%`} icon={<TrendingUp size={16} />}     color="yellow" />
            <StatCard label="Today's Events" value={analytics.eventsToday}         icon={<CalendarDays size={16} />}   color="blue"   />
            <StatCard label="Missed"         value={analytics.missedEvents}        icon={<AlertTriangle size={16} />}  color="orange" />
          </div>
        </section>

        {/* ── Analytics Bars ── */}
        <section>
          <SectionHeading>Analytics</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnalyticsBar label="Task Completion"   value={analytics.taskCompletion} color="indigo" />
            <AnalyticsBar label="Goal Avg Progress" value={analytics.goalProgress}   color="purple" />
          </div>
        </section>

        {/* ── Recent Tasks ── */}
        <section>
          <SectionHeading>
            Recent Tasks
            {tasks.length > 5 && (
              <span className="ml-2 text-gray-400 font-normal normal-case tracking-normal">
                (showing 5 of {tasks.length})
              </span>
            )}
          </SectionHeading>
          {tasks.length === 0 ? (
            <EmptyState message="No tasks yet. Head over to Tasks to create one." />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              {recentTasks.map((task, i) => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/60 transition-colors ${
                    i < recentTasks.length - 1 ? "border-b border-gray-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {task.status === "done"
                      ? <CheckCircle2 size={15} className="text-green-500 flex-shrink-0" />
                      : <Circle size={15} className="text-gray-300 flex-shrink-0" />
                    }
                    <span className={`text-sm truncate pr-4 ${task.status === "done" ? "line-through text-gray-400" : "text-gray-700"}`}>
                      {task.title}
                    </span>
                  </div>
                  <TaskStatusBadge status={task.status} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Goals Progress ── */}
        <section>
          <SectionHeading>Goals Progress</SectionHeading>
          {goals.length === 0 ? (
            <EmptyState message="No goals yet. Head over to Goals to set one." />
          ) : (
            <div className="space-y-3">
              {[...goals]
                .sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0))
                .map((goal) => {
                  const p = goal.progress ?? 0;
                  const highlight = p >= 80;
                  return (
                    <div
                      key={goal.id}
                      className={`bg-white rounded-2xl px-5 py-4 border transition-all duration-200 hover:shadow-md ${
                        highlight ? "border-green-200 ring-1 ring-green-100" : "border-gray-100"
                      }`}
                      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                    >
                      <div className="flex justify-between items-center mb-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <Target size={14} className={highlight ? "text-green-500" : "text-gray-400"} />
                          <span className={`text-sm font-semibold truncate ${highlight ? "text-green-700" : "text-gray-700"}`}>
                            {goal.name}
                          </span>
                          {highlight && (
                            <span className="flex-shrink-0 text-[10px] font-bold bg-green-100 text-green-600 px-2 py-0.5 rounded-full uppercase tracking-wide">
                              Almost there!
                            </span>
                          )}
                        </div>
                        <span className={`text-sm font-bold flex-shrink-0 ml-3 ${highlight ? "text-green-600" : "text-gray-500"}`}>
                          {p}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-500 ${
                            p >= 80 ? "bg-green-500" : p >= 50 ? "bg-indigo-500" : p >= 25 ? "bg-amber-400" : "bg-red-400"
                          }`}
                          style={{ width: `${p}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1.5">Target: {goal.targetDate}</p>
                    </div>
                  );
                })}
            </div>
          )}
        </section>

        {/* ── Today's Schedule ── */}
        <section>
          <SectionHeading>Today&apos;s Schedule</SectionHeading>
          {todayEvents.length === 0 ? (
            <EmptyState message="Nothing scheduled for today." />
          ) : (
            <div className="space-y-2">
              {[...todayEvents]
                .sort((a, b) => (a.startTime > b.startTime ? 1 : -1))
                .map((event) => (
                  <div
                    key={event.id}
                    className={`flex items-center gap-4 rounded-2xl px-5 py-3.5 border transition-all ${
                      event.completed
                        ? "bg-green-50 border-green-100"
                        : "bg-white border-gray-100"
                    }`}
                    style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${event.completed ? "bg-green-500" : "bg-indigo-400"}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${event.completed ? "line-through text-gray-400" : "text-gray-800"}`}>
                        {event.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{event.startTime} – {event.endTime}</p>
                    </div>
                    <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      event.completed ? "bg-green-100 text-green-700" : "bg-indigo-50 text-indigo-600"
                    }`}>
                      {event.completed ? "Done" : "Pending"}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionHeading({ children }) {
  return (
    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
      {children}
    </h3>
  );
}

function StatCard({ label, value, icon, color }) {
  const palette = {
    indigo: { bg: "#eef2ff", text: "#4338ca", icon: "#6366f1" },
    green:  { bg: "#f0fdf4", text: "#15803d", icon: "#22c55e" },
    red:    { bg: "#fef2f2", text: "#dc2626", icon: "#ef4444" },
    purple: { bg: "#faf5ff", text: "#7e22ce", icon: "#a855f7" },
    yellow: { bg: "#fefce8", text: "#854d0e", icon: "#eab308" },
    blue:   { bg: "#eff6ff", text: "#1d4ed8", icon: "#3b82f6" },
    orange: { bg: "#fff7ed", text: "#c2410c", icon: "#f97316" },
  };
  const p = palette[color];
  return (
    <div
      className="rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      style={{ backgroundColor: p.bg, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
    >
      <div className="flex items-center justify-between mb-2">
        <span style={{ color: p.icon }}>{icon}</span>
      </div>
      <p className="text-2xl font-bold leading-none" style={{ color: p.text }}>{value}</p>
      <p className="text-xs font-medium mt-1.5" style={{ color: p.text, opacity: 0.7 }}>{label}</p>
    </div>
  );
}

function AnalyticsBar({ label, value, color }) {
  const track = { indigo: "bg-indigo-500", purple: "bg-purple-500", blue: "bg-blue-500" };
  return (
    <div
      className="bg-white rounded-2xl p-5 border border-gray-100 transition-all duration-200 hover:shadow-md"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
    >
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold text-gray-600">{label}</span>
        <span className="text-sm font-bold text-gray-900">{value}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={`h-2 rounded-full transition-all duration-700 ${track[color]}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function TaskStatusBadge({ status }) {
  const styles = {
    todo:  "bg-gray-100 text-gray-500",
    doing: "bg-amber-100 text-amber-700",
    done:  "bg-green-100 text-green-700",
  };
  return (
    <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${styles[status] ?? styles.todo}`}>
      {status}
    </span>
  );
}

function EmptyState({ message }) {
  return (
    <div className="bg-white rounded-2xl p-8 text-center border border-gray-100" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  );
}
