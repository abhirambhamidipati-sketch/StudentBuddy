import { useState, useEffect } from "react";
import { authFetch } from "../api.js";

const TODAY = new Date().toLocaleDateString("en-CA");

export default function TimetableView() {
  const [events,    setEvents]    = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form,      setForm]      = useState({ title: "", date: "", startTime: "", endTime: "" });
  const [errors,    setErrors]    = useState({});

  useEffect(() => {
    authFetch("/events").then((r) => r.json()).then(setEvents);
  }, []);

  // ── Validation ───────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.title.trim()) {
      e.title = "Event title is required.";
    }
    if (!form.date) {
      e.date = "Date is required.";
    } else if (form.date < TODAY) {
      e.date = "Date must be today or in the future.";
    }
    if (!form.startTime) {
      e.startTime = "Start time is required.";
    }
    if (!form.endTime) {
      e.endTime = "End time is required.";
    } else if (form.startTime && form.endTime && form.endTime <= form.startTime) {
      e.endTime = "End time must be after start time.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Add ──────────────────────────────────────────────────────────────────────
  const addEvent = () => {
    if (!validate()) return;
    const item = {
      id: Date.now().toString(),
      title:     form.title.trim(),
      date:      form.date,
      startTime: form.startTime,
      endTime:   form.endTime,
      completed: false,
    };
    authFetch("/events", {
      method: "POST",
      body:   JSON.stringify(item),
    }).then(() => {
      setEvents((prev) => [...prev, item]);
      closeModal();
      window.dispatchEvent(new CustomEvent("studentbuddy:data-changed"));
    });
  };

  const closeModal = () => { setShowModal(false); setForm({ title: "", date: "", startTime: "", endTime: "" }); setErrors({}); };

  // ── Toggle completion ─────────────────────────────────────────────────────────
  const toggleComplete = (id) => {
    const event = events.find((e) => e.id === id);
    if (!event) return;
    const newCompleted = !event.completed;
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, completed: newCompleted } : e)));
    authFetch(`/events/${id}`, { method: "PUT", body: JSON.stringify({ completed: newCompleted }) })
      .then(() => {
        window.dispatchEvent(new CustomEvent("studentbuddy:data-changed"));
      });
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const deleteEvent = (id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    authFetch(`/events/${id}`, { method: "DELETE" }).then(() => {
      window.dispatchEvent(new CustomEvent("studentbuddy:data-changed"));
    });
  };

  const sorted = [...events].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.date !== b.date) return a.date > b.date ? 1 : -1;
    return a.startTime > b.startTime ? 1 : -1;
  });

  return (
    <>
      {/* Top bar */}
      <div className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Timetable</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition text-sm font-medium shadow-sm"
        >
          + Add Event
        </button>
      </div>

      {/* Event list */}
      <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-indigo-100 via-white to-blue-100">
        {sorted.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-400 text-base">
            No events yet. Schedule something!
          </div>
        ) : (
          <div className="space-y-3 max-w-2xl mx-auto">
            {sorted.map((event) => (
              <div
                key={event.id}
                className={`bg-white rounded-xl px-5 py-4 shadow-sm flex items-center gap-4 transition duration-200 ${event.completed ? "opacity-60" : "hover:shadow-md"}`}
              >
                <button
                  onClick={() => toggleComplete(event.id)}
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition duration-150 ${
                    event.completed ? "bg-green-500 border-green-500 text-white" : "border-red-400 hover:border-green-400 hover:bg-green-50"
                  }`}
                  title={event.completed ? "Mark pending" : "Mark complete"}
                >
                  {event.completed && (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${event.completed ? "line-through text-gray-400" : "text-gray-800"}`}>
                    {event.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{event.date}&nbsp;·&nbsp;{event.startTime} – {event.endTime}</p>
                </div>
                <span className={`flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${event.completed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                  {event.completed ? "Done" : "Pending"}
                </span>
                <button onClick={() => deleteEvent(event.id)} className="flex-shrink-0 text-gray-300 hover:text-red-400 transition text-sm" title="Delete event">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add event modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white p-6 rounded-2xl shadow-xl w-96">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Event</h2>

            <label className="block text-sm font-medium text-gray-600 mb-1">Title</label>
            <input
              type="text"
              placeholder="e.g. OOPs lecture"
              value={form.title}
              onChange={(e) => { setForm({ ...form, title: e.target.value }); if (e.target.value.trim()) setErrors((p) => ({ ...p, title: undefined })); }}
              className={`w-full border rounded-lg px-3 py-2 text-sm mb-1 outline-none focus:ring-2 transition ${errors.title ? "border-red-400 focus:ring-red-200" : "border-gray-300 focus:ring-indigo-200 focus:border-indigo-400"}`}
              autoFocus
            />
            {errors.title ? <p className="text-red-500 text-xs mb-3">{errors.title}</p> : <div className="mb-4" />}

            <label className="block text-sm font-medium text-gray-600 mb-1">Date</label>
            <input
              type="date"
              min={TODAY}
              value={form.date}
              onChange={(e) => { setForm({ ...form, date: e.target.value }); if (e.target.value >= TODAY) setErrors((p) => ({ ...p, date: undefined })); }}
              className={`w-full border rounded-lg px-3 py-2 text-sm mb-1 outline-none focus:ring-2 transition ${errors.date ? "border-red-400 focus:ring-red-200" : "border-gray-300 focus:ring-indigo-200 focus:border-indigo-400"}`}
            />
            {errors.date ? <p className="text-red-500 text-xs mb-3">{errors.date}</p> : <div className="mb-4" />}

            <div className="grid grid-cols-2 gap-3 mb-1">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Start time</label>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => { setForm({ ...form, startTime: e.target.value }); setErrors((p) => ({ ...p, startTime: undefined, endTime: undefined })); }}
                  className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 transition ${errors.startTime ? "border-red-400 focus:ring-red-200" : "border-gray-300 focus:ring-indigo-200 focus:border-indigo-400"}`}
                />
                {errors.startTime && <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">End time</label>
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => { setForm({ ...form, endTime: e.target.value }); setErrors((p) => ({ ...p, endTime: undefined })); }}
                  className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 transition ${errors.endTime ? "border-red-400 focus:ring-red-200" : "border-gray-300 focus:ring-indigo-200 focus:border-indigo-400"}`}
                />
                {errors.endTime && <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button onClick={closeModal} className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium">Cancel</button>
              <button onClick={addEvent}   className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-sm">Add Event</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
