import { useState, useRef, useEffect } from "react";
import { Bot, Send, User } from "lucide-react";
import { authFetch } from "../api.js";

const WELCOME = "Hi! I'm your StudentBuddy assistant.\nTry:\n• add task Study for OOPs exam\n• view tasks  /  view done tasks\n• complete task Study for OOPs exam\n• view goals\n• analytics";

export default function ChatView() {
  const [messages, setMessages] = useState([{ role: "bot", text: WELCOME }]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setLoading(true);

    try {
      const res  = await authFetch("/chat", {
        method: "POST",
        body:   JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, {
        role: "bot",
        text: data.reply ?? "Sorry, something went wrong.",
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: "bot",
        text: "Could not reach the server. Is the backend running?",
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">

      {/* Top bar */}
      <div
        className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3 flex-shrink-0"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)" }}
        >
          <Bot size={18} className="text-white" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900 tracking-tight leading-none">Assistant</h2>
          <p className="text-xs text-gray-400 mt-0.5">Ask me to manage tasks, goals, or check analytics</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-xs text-gray-400">Online</span>
        </div>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-end gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            {/* Avatar */}
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5 ${
                msg.role === "user"
                  ? "bg-indigo-100"
                  : ""
              }`}
              style={msg.role === "bot" ? { background: "linear-gradient(135deg,#6366f1,#8b5cf6)" } : {}}
            >
              {msg.role === "user"
                ? <User size={13} className="text-indigo-600" />
                : <Bot  size={13} className="text-white" />
              }
            </div>

            {/* Bubble */}
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm whitespace-pre-line leading-relaxed ${
                msg.role === "user"
                  ? "text-white rounded-br-sm"
                  : "bg-white text-gray-800 rounded-bl-sm border border-gray-100"
              }`}
              style={msg.role === "user"
                ? {
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    boxShadow:  "0 2px 8px rgba(99,102,241,0.25)",
                  }
                : { boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }
              }
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-end gap-2.5">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
            >
              <Bot size={13} className="text-white" />
            </div>
            <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div className="flex gap-1 items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div
        className="bg-white border-t border-gray-100 px-4 py-3 flex-shrink-0"
        style={{ boxShadow: "0 -1px 3px rgba(0,0,0,0.03)" }}
      >
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type a command or question…"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition bg-gray-50/50"
            autoFocus
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            style={{
              background: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)",
              boxShadow:  "0 2px 8px rgba(99,102,241,0.35)",
            }}
          >
            <Send size={15} className="text-white" />
          </button>
        </div>
      </div>

    </div>
  );
}
