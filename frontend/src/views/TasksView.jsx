import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { authFetch } from "../api.js";

const COLUMNS = ["todo", "doing", "done"];

const COL_CONFIG = {
  todo:  { label: "To Do",       dotCls: "bg-gray-400",   headerCls: "text-gray-600"   },
  doing: { label: "In Progress", dotCls: "bg-amber-400",  headerCls: "text-amber-600"  },
  done:  { label: "Done",        dotCls: "bg-green-500",  headerCls: "text-green-600"  },
};

export default function TasksView() {
  const [tasks,     setTasks]     = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newTask,   setNewTask]   = useState("");
  const [taskError, setTaskError] = useState("");

  useEffect(() => {
    authFetch("/tasks").then((r) => r.json()).then(setTasks);
  }, []);

  const validate = () => {
    if (!newTask.trim()) {
      setTaskError("Task title cannot be empty.");
      return false;
    }
    setTaskError("");
    return true;
  };

  const addTask = () => {
    if (!validate()) return;
    const item = { id: Date.now().toString(), title: newTask.trim(), status: "todo" };
    authFetch("/tasks", { method: "POST", body: JSON.stringify(item) }).then(() => {
      setTasks((prev) => [...prev, item]);
      setNewTask("");
      setTaskError("");
      setShowModal(false);
      window.dispatchEvent(new CustomEvent("studentbuddy:data-changed"));
    });
  };

  const closeModal = () => { setShowModal(false); setNewTask(""); setTaskError(""); };

  const deleteTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    authFetch(`/tasks/${id}`, { method: "DELETE" }).then(() => {
      window.dispatchEvent(new CustomEvent("studentbuddy:data-changed"));
    });
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { draggableId, source, destination } = result;
    const newStatus = destination.droppableId;

    setTasks((prev) =>
      prev.map((t) => (t.id === draggableId ? { ...t, status: newStatus } : t))
    );

    if (source.droppableId === destination.droppableId) return;

    const task = tasks.find((t) => t.id === draggableId);
    if (!task) return;
    authFetch(`/tasks/${draggableId}`, {
      method: "PUT",
      body:   JSON.stringify({ id: task.id, title: task.title, status: newStatus }),
    }).then(() => {
      window.dispatchEvent(new CustomEvent("studentbuddy:data-changed"));
    });
  };

  return (
    <>
      {/* Top bar */}
      <div
        className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center flex-shrink-0"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
      >
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Tasks</h2>
          <p className="text-sm text-gray-400 mt-0.5">{tasks.length} task{tasks.length !== 1 ? "s" : ""} total</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-bold active:scale-95 transition-all"
          style={{
            background:  "linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)",
            boxShadow:   "0 4px 12px rgba(99,102,241,0.35)",
          }}
        >
          <Plus size={15} />
          Add Task
        </button>
      </div>

      {/* Kanban board */}
      <div className="flex-1 p-6 overflow-x-auto bg-[#f8fafc]">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-3 gap-5 min-w-[640px]">
            {COLUMNS.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col);
              const { label, dotCls, headerCls } = COL_CONFIG[col];
              return (
                <Droppable droppableId={col} key={col}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`rounded-2xl p-4 min-h-[440px] transition-all duration-150 ${
                        snapshot.isDraggingOver
                          ? "bg-indigo-50 ring-2 ring-indigo-200"
                          : "bg-white border border-gray-100"
                      }`}
                      style={{ boxShadow: snapshot.isDraggingOver ? undefined : "0 1px 4px rgba(0,0,0,0.05)" }}
                    >
                      {/* Column header */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className={`w-2 h-2 rounded-full ${dotCls}`} />
                        <h3 className={`text-sm font-bold ${headerCls}`}>{label}</h3>
                        <span className="ml-auto text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          {colTasks.length}
                        </span>
                      </div>

                      {/* Tasks */}
                      <div className="space-y-2.5">
                        {colTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`relative bg-white p-3.5 rounded-xl border transition-all duration-150 cursor-grab group ${
                                  snapshot.isDragging
                                    ? "shadow-xl rotate-1 scale-[1.02] border-indigo-200 ring-1 ring-indigo-200"
                                    : "border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  <GripVertical size={13} className="text-gray-300 flex-shrink-0 mt-0.5 group-hover:text-gray-400 transition-colors" />
                                  <span className={`flex-1 text-sm leading-snug ${col === "done" ? "line-through text-gray-400" : "text-gray-700"}`}>
                                    {task.title}
                                  </span>
                                  <button
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={() => deleteTask(task.id)}
                                    className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all"
                                    title="Delete task"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {colTasks.length === 0 && !snapshot.isDraggingOver && (
                          <p className="text-xs text-gray-300 text-center pt-8 select-none">
                            Drop tasks here
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {/* Add task modal */}
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
                <Plus size={16} className="text-white" />
                <h2 className="text-base font-bold text-white">New Task</h2>
              </div>
              <button
                onClick={closeModal}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-lg leading-none transition"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Task title</label>
              <input
                type="text"
                placeholder="e.g. Study for OOPs exam"
                value={newTask}
                onChange={(e) => { setNewTask(e.target.value); if (e.target.value.trim()) setTaskError(""); }}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm mb-1 outline-none focus:ring-2 transition ${
                  taskError
                    ? "border-red-300 focus:ring-red-100"
                    : "border-gray-200 focus:ring-indigo-100 focus:border-indigo-400"
                }`}
                autoFocus
              />
              {taskError ? <p className="text-red-500 text-xs mb-4">{taskError}</p> : <div className="mb-4" />}
              <div className="flex gap-2">
                <button
                  onClick={closeModal}
                  className="flex-1 py-2.5 text-sm font-bold bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={addTask}
                  className="flex-1 py-2.5 text-sm font-bold text-white rounded-xl transition active:scale-95"
                  style={{ background: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)" }}
                >
                  Add Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
