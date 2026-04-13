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
    </div>
  );
}
