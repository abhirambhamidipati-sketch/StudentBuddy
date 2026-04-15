<<<<<<< HEAD
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

=======
import { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

const API = "http://localhost:8080";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState("");

  const columns = ["todo", "doing", "done"];

  // ── Fetch all tasks on mount ──────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API}/tasks`)
      .then((res) => res.json())
      .then((data) => setTasks(data));
  }, []);

  // ── Add task ──────────────────────────────────────────────────────────────
  const addTask = () => {
    if (!newTask.trim()) return;

    const newItem = {
      id: Date.now().toString(),
      title: newTask.trim(),
      status: "todo",
    };

    fetch(`${API}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    }).then(() => {
      setTasks((prev) => [...prev, newItem]);
      setNewTask("");
      setShowModal(false);
    });
  };

  // ── Delete task ───────────────────────────────────────────────────────────
  const deleteTask = (taskId) => {
    // Optimistic: remove from UI immediately
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    fetch(`${API}/tasks/${taskId}`, { method: "DELETE" });
  };

  // ── Drag-drop: optimistic update + backend sync ───────────────────────────
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { draggableId, source, destination } = result;
    const newStatus = destination.droppableId;

    // Always update UI
    setTasks((prev) =>
      prev.map((t) =>
        t.id === draggableId ? { ...t, status: newStatus } : t
      )
    );

    // Only persist to backend when the column (status) actually changed
    if (source.droppableId === destination.droppableId) return;

    const task = tasks.find((t) => t.id === draggableId);
    if (!task) return;

    fetch(`${API}/tasks/${draggableId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task.id, title: task.title, status: newStatus }),
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">

      {/* SIDEBAR */}
      <div className="w-64 bg-indigo-600 text-white flex flex-col p-5">
        <h1 className="text-2xl font-bold mb-10">StudentBuddy</h1>

        <nav className="space-y-4">
          <div className="hover:bg-indigo-500 p-2 rounded cursor-pointer">Dashboard</div>
          <div className="hover:bg-indigo-500 p-2 rounded cursor-pointer">Tasks</div>
          <div className="hover:bg-indigo-500 p-2 rounded cursor-pointer">Goals</div>
          <div className="hover:bg-indigo-500 p-2 rounded cursor-pointer">Analytics</div>
        </nav>
      </div>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">

        {/* TOPBAR */}
        <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-700">Dashboard</h2>

          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            + Add Task
          </button>
        </div>

        {/* KANBAN BOARD */}
        <div className="flex-1 p-6 overflow-x-auto bg-gradient-to-br from-indigo-100 via-white to-blue-100">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-3 gap-6">

              {columns.map((col) => (
                <Droppable droppableId={col} key={col}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="bg-white rounded-xl p-4 shadow-md min-h-[400px]"
                    >
                      <h2 className="text-lg font-semibold mb-4 capitalize">{col}</h2>

                      <div className="space-y-4">
                        {tasks
                          .filter((t) => t.status === col)
                          .map((task, index) => (
                            <Draggable
                              key={task.id}
                              draggableId={task.id}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="relative bg-white p-4 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-300 cursor-pointer"
                                >
                                  <span className="pr-6 block">{task.title}</span>

                                  {/* Delete button — stopPropagation prevents drag from firing */}
                                  <button
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={() => deleteTask(task.id)}
                                    className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full text-gray-300 hover:text-red-400 hover:bg-red-50 transition text-xs leading-none"
                                    title="Delete task"
                                  >
                                    ✕
                                  </button>
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              ))}

            </div>
          </DragDropContext>
        </div>
      </div>

      {/* ADD TASK MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Add New Task</h2>

            <input
              type="text"
              placeholder="Enter task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              className="w-full border p-2 rounded mb-4"
              autoFocus
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>

              <button
                onClick={addTask}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
>>>>>>> 76ef85031b1cf4be3cb25367f38c3cfec22308a3
    </div>
  );
}
