import { useState, useEffect } from "react";
import { Plus, Trash2, Target, TrendingUp, MessageSquare } from "lucide-react";
import { authFetch } from "../api.js";
import GoalNotesModal from "../components/GoalNotesModal.jsx";

export default function GoalsView() {
  const [goals,      setGoals]      = useState([]);
  const [showModal,  setShowModal]  = useState(false);
  const [notesGoal,  setNotesGoal]  = useState(null);   // goal whose notes are open
  const [form,       setForm]       = useState({ name: "", targetDate: "" });
  const [errors,     setErrors]     = useState({});

  useEffect(() => {
    authFetch("/goals").then((r) => r.json()).then(setGoals);
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name       = "Goal name is required.";
    if (!form.targetDate)  e.targetDate = "Target date is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const addGoal = () => {
    if (!validate()) return;
    const item = {
      id:         Date.now().toString(),
      name:       form.name.trim(),
      targetDate: form.targetDate,
      progress:   0,
    };
    authFetch("/goals", { method: "POST", body: JSON.stringify(item) }).then(() => {
      setGoals((prev) => [...prev, item]);
      closeModal();
      window.dispatchEvent(new CustomEvent("studentbuddy:data-changed"));
    });
  };

  const closeModal = () => { setShowModal(false); setForm({ name: "", targetDate: "" }); setErrors({}); };

  const updateProgress = (id, progress) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, progress } : g)));
    authFetch(`/goals/${id}`, { method: "PUT", body: JSON.stringify({ progress }) }).then(() => {
      window.dispatchEvent(new CustomEvent("studentbuddy:data-changed"));
    });
  };

  const deleteGoal = (id) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    authFetch(`/goals/${id}`, { method: "DELETE" }).then(() => {
      window.dispatchEvent(new CustomEvent("studentbuddy:data-changed"));
    });
  };

  const progressColor = (p) => {
    if (p >= 100) return "bg-green-500";
    if (p >= 50)  return "bg-indigo-500";
    if (p >= 25)  return "bg-amber-400";
    return "bg-red-400";
  };

  const progressLabel = (p) => {
    if (p >= 100) return { text: "Complete!", cls: "bg-green-100 text-green-700" };
    if (p >= 80)  return { text: "Almost there!", cls: "bg-indigo-100 text-indigo-700" };
    if (p >= 50)  return { text: "Halfway", cls: "bg-amber-100 text-amber-700" };
    return null;
  };

  return (
    <>
      {/* Top bar */}
      <div
        className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center flex-shrink-0"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
      >
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Goals</h2>
          <p className="text-sm text-gray-400 mt-0.5">{goals.length} goal{goals.length !== 1 ? "s" : ""} tracked</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-bold active:scale-95 transition-all"
          style={{
            background: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)",
            boxShadow:  "0 4px 12px rgba(99,102,241,0.35)",
          }}
        >
          <Plus size={15} />
          Add Goal
        </button>
      </div>

      {/* Goal cards */}
      <div className="flex-1 p-6 overflow-y-auto bg-[#f8fafc]">
        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#eef2ff,#e0e7ff)" }}
            >
              <Target size={28} className="text-indigo-400" />
            </div>
            <p className="text-gray-500 font-medium text-sm">No goals yet</p>
            <p className="text-gray-400 text-sm text-center max-w-xs">
              Set a goal to start tracking your progress towards your academic targets.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {goals.map((goal) => {
              const p     = goal.progress ?? 0;
              const badge = progressLabel(p);
              return (
                <div
                  key={goal.id}
                  className="bg-white rounded-2xl p-5 border border-gray-100 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg group flex flex-col"
                  style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
                >
                  {/* Card header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: "linear-gradient(135deg,#eef2ff,#e0e7ff)" }}
                      >
                        <Target size={16} className="text-indigo-500" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-gray-800 leading-snug pr-2">{goal.name}</h3>
                        {badge && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${badge.cls}`}>
                            {badge.text}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                      title="Delete goal"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <p className="text-xs text-gray-400 mb-4 flex items-center gap-1.5">
                    <TrendingUp size={11} />
                    Target: {goal.targetDate}
                  </p>

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-500 font-medium">Progress</span>
                      <span className="font-bold text-gray-800">{p}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${progressColor(p)}`}
                        style={{ width: `${p}%` }}
                      />
                    </div>
                  </div>

                  <input
                    type="range" min={0} max={100} step={5} value={p}
                    onChange={(e) => updateProgress(goal.id, Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />

                  {/* Notes button — pushed to bottom */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => setNotesGoal(goal)}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
                      style={{
                        color:           "#6366f1",
                        backgroundColor: "#eef2ff",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = "#e0e7ff";
                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(99,102,241,0.15)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = "#eef2ff";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <MessageSquare size={13} />
                      Notes &amp; History
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add goal modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden w-96"
            style={{ boxShadow: "0 24px 48px rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.05)" }}
          >
            {/* Modal header */}
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ background: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)" }}
            >
              <div className="flex items-center gap-2">
                <Target size={16} className="text-white" />
                <h2 className="text-base font-bold text-white">New Goal</h2>
              </div>
              <button
                onClick={closeModal}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-lg leading-none transition"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Goal name</label>
                <input
                  type="text"
                  placeholder="e.g. Complete DSA revision"
                  value={form.name}
                  onChange={(e) => { setForm({ ...form, name: e.target.value }); if (e.target.value.trim()) setErrors((p) => ({ ...p, name: undefined })); }}
                  onKeyDown={(e) => e.key === "Enter" && addGoal()}
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 transition ${errors.name ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:ring-indigo-100 focus:border-indigo-400"}`}
                  autoFocus
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Target date</label>
                <input
                  type="date"
                  value={form.targetDate}
                  onChange={(e) => { setForm({ ...form, targetDate: e.target.value }); if (e.target.value) setErrors((p) => ({ ...p, targetDate: undefined })); }}
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 transition ${errors.targetDate ? "border-red-300 focus:ring-red-100" : "border-gray-200 focus:ring-indigo-100 focus:border-indigo-400"}`}
                />
                {errors.targetDate && <p className="text-red-500 text-xs mt-1">{errors.targetDate}</p>}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={closeModal}
                  className="flex-1 py-2.5 text-sm font-bold bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={addGoal}
                  className="flex-1 py-2.5 text-sm font-bold text-white rounded-xl transition active:scale-95"
                  style={{ background: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)" }}
                >
                  Add Goal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goal Notes modal */}
      {notesGoal && (
        <GoalNotesModal
          goal={notesGoal}
          onClose={() => setNotesGoal(null)}
        />
      )}
    </>
  );
}
