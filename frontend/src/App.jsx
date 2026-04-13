import { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState("");

  const columns = ["todo", "doing", "done"];

  // 🔥 FETCH FROM BACKEND
  useEffect(() => {
    fetch("http://localhost:8080/tasks")
      .then((res) => res.json())
      .then((data) => setTasks(data));
  }, []);

  // 🔥 DRAG UPDATE
  const onDragEnd = (result) => {
    if (!result.destination) return;

    setTasks((prev) =>
      prev.map((task) =>
        task.id === result.draggableId
          ? { ...task, status: result.destination.droppableId }
          : task
      )
    );
  };

  // 🔥 ADD TASK (SEND TO BACKEND)
  const addTask = () => {
    if (!newTask.trim()) return;

    const newItem = {
      id: Date.now().toString(),
      title: newTask,
      status: "todo",
    };

    fetch("http://localhost:8080/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newItem),
    }).then(() => {
      setTasks([...tasks, newItem]);
      setNewTask("");
      setShowModal(false);
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">

      {/* SIDEBAR */}
      <div className="w-64 bg-indigo-600 text-white flex flex-col p-5">
        <h1 className="text-2xl font-bold mb-10">StudentBuddy</h1>

        <nav className="space-y-4">
          <div className="hover:bg-indigo-500 p-2 rounded cursor-pointer">
            Dashboard
          </div>
          <div className="hover:bg-indigo-500 p-2 rounded cursor-pointer">
            Tasks
          </div>
          <div className="hover:bg-indigo-500 p-2 rounded cursor-pointer">
            Goals
          </div>
          <div className="hover:bg-indigo-500 p-2 rounded cursor-pointer">
            Analytics
          </div>
        </nav>
      </div>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">

        {/* TOPBAR */}
        <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-700">
            Dashboard
          </h2>

          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            + Add Task
          </button>
        </div>

        {/* BOARD */}
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
                      <h2 className="text-lg font-semibold mb-4 capitalize">
                        {col}
                      </h2>

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
                                  className="bg-white p-4 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-300 cursor-pointer"
                                >
                                  {task.title}
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

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">

            <h2 className="text-xl font-semibold mb-4">Add New Task</h2>

            <input
              type="text"
              placeholder="Enter task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="w-full border p-2 rounded mb-4"
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