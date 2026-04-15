import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { authFetch } from "../api.js";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const HOUR_HEIGHT = 64;          // px per hour in the grid
const HOUR_START  = 7;           // 7 AM
const HOUR_END    = 22;          // 10 PM
const TOTAL_H     = (HOUR_END - HOUR_START) * HOUR_HEIGHT;
const HOURS       = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => i + HOUR_START);

// ─────────────────────────────────────────────────────────────────────────────
// Color palette — deterministic per event (based on id hash)
// ─────────────────────────────────────────────────────────────────────────────
const PALETTES = [
  { bar: "#6366f1", bg: "#eef2ff", text: "#3730a3", grad: "linear-gradient(150deg,#f0f3ff 0%,#e8edff 100%)" }, // indigo
  { bar: "#8b5cf6", bg: "#f5f3ff", text: "#5b21b6", grad: "linear-gradient(150deg,#faf8ff 0%,#ede9fe 100%)" }, // violet
  { bar: "#10b981", bg: "#ecfdf5", text: "#065f46", grad: "linear-gradient(150deg,#f2fef9 0%,#d1fae5 100%)" }, // emerald
  { bar: "#f59e0b", bg: "#fffbeb", text: "#78350f", grad: "linear-gradient(150deg,#fffef5 0%,#fef3c7 100%)" }, // amber
  { bar: "#ef4444", bg: "#fef2f2", text: "#991b1b", grad: "linear-gradient(150deg,#fff5f5 0%,#fee2e2 100%)" }, // red
  { bar: "#06b6d4", bg: "#ecfeff", text: "#155e75", grad: "linear-gradient(150deg,#f0feff 0%,#cffafe 100%)" }, // cyan
  { bar: "#f97316", bg: "#fff7ed", text: "#7c2d12", grad: "linear-gradient(150deg,#fffbf5 0%,#ffedd5 100%)" }, // orange
  { bar: "#14b8a6", bg: "#f0fdfa", text: "#134e4a", grad: "linear-gradient(150deg,#f0fdfb 0%,#ccfbf1 100%)" }, // teal
];

function getColor(ev) {
  let h = 0;
  const s = (ev.id || "") + (ev.title || "");
  for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; }
  return PALETTES[Math.abs(h) % PALETTES.length];
}

// ─────────────────────────────────────────────────────────────────────────────
// Pure time / date helpers
// ─────────────────────────────────────────────────────────────────────────────
function toMins(t) {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function toY(t) {
  return Math.max(0, ((toMins(t) - HOUR_START * 60) / 60) * HOUR_HEIGHT);
}

function toH(startT, endT) {
  return Math.max(22, ((toMins(endT) - toMins(startT)) / 60) * HOUR_HEIGHT);
}

function fmt12(t) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function dateStr(d) {
  return d.toLocaleDateString("en-CA"); // YYYY-MM-DD
}

function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function startOfWeek(d) {
  const day = d.getDay();
  return addDays(d, day === 0 ? -6 : 1 - day); // Monday-anchored
}

function getWeekDays(d) {
  const mon = startOfWeek(d);
  return Array.from({ length: 7 }, (_, i) => addDays(mon, i));
}

function fmtDayOfWeek(d) {
  return d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
}

/** Parse "YYYY-MM-DD" as local midnight — avoids UTC timezone shift. */
function parseDate(str) {
  if (!str) return new Date();
  if (typeof str !== "string") return new Date(str);
  const [y, m, dd] = str.split("-").map(Number);
  return new Date(y, m - 1, dd);
}

/**
 * Normalise an ev.date value to "YYYY-MM-DD" regardless of whether
 * the backend sends a string, ISO timestamp, or [y,m,d] array.
 */
function normaliseDate(raw) {
  if (!raw) return "";
  if (typeof raw === "string") return raw.slice(0, 10);
  if (Array.isArray(raw)) {
    const [y, m, d] = raw;
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }
  return new Date(raw).toLocaleDateString("en-CA");
}

// ─────────────────────────────────────────────────────────────────────────────
// Overlap layout — assign _col / _total so events never visually collide
// ─────────────────────────────────────────────────────────────────────────────
function computeLayout(evs) {
  const sorted = [...evs].sort((a, b) => toMins(a.startTime) - toMins(b.startTime));
  const cols   = []; // cols[i] = end-minute of last event placed in column i
  const placed = sorted.map(ev => {
    const s = toMins(ev.startTime);
    const e = toMins(ev.endTime) || s + 30;
    let col = cols.findIndex(end => end <= s);
    if (col === -1) { col = cols.length; cols.push(e); }
    else cols[col] = e;
    return { ev, col };
  });
  const total = Math.max(cols.length, 1);
  return placed.map(({ ev, col }) => ({ ...ev, _col: col, _total: total }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared input / form primitives
// ─────────────────────────────────────────────────────────────────────────────
function inputCls(err) {
  return (
    "w-full border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 transition " +
    (err
      ? "border-red-300 focus:ring-red-100"
      : "border-gray-200 focus:ring-indigo-100 focus:border-indigo-400")
  );
}

function FormField({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-widest">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EventBlock — premium event rectangle inside the time grid
// ─────────────────────────────────────────────────────────────────────────────
function deriveTag(title) {
  const low = (title || "").toLowerCase();
  if (low.includes("lab"))        return "Lab";
  if (low.includes("tutorial"))   return "Tut";
  if (low.includes("practical"))  return "Prac";
  if (low.includes("online"))     return "Online";
  if (low.includes("lecture"))    return "Lec";
  if (low.includes("seminar"))    return "Seminar";
  if (low.includes("workshop"))   return "WS";
  return null;
}

function EventBlock({ ev, style, onClick }) {
  const color   = getColor(ev);
  const h       = typeof style.height === "number" ? style.height : 0;
  const compact = h < 40;    // only title fits
  const tall    = h > 78;    // enough room for badges + time footer

  // Derive a short code badge from title (e.g. "Software Engineering" → "SE")
  const initials = (ev.title || "")
    .split(/\s+/)
    .filter(w => w.length > 1)
    .slice(0, 3)
    .map(w => w[0].toUpperCase())
    .join("");
  const typeTag = deriveTag(ev.title);

  return (
    <div
      style={{
        ...style,
        background:  color.grad,
        borderLeft:  `4px solid ${color.bar}`,
        boxShadow:   "0 1px 4px rgba(0,0,0,0.07), 0 0 0 0.5px rgba(0,0,0,0.04)",
      }}
      className="absolute rounded-r-xl overflow-hidden cursor-pointer select-none group
                 hover:shadow-[0_4px_16px_rgba(0,0,0,0.14)] hover:-translate-y-px
                 transition-all duration-200 ease-out"
      onClick={onClick}
    >
      <div className="flex flex-col h-full px-2.5 pt-2 pb-1.5 gap-0.5 overflow-hidden">

        {/* ── Title ── */}
        <p
          className="text-[12px] font-semibold leading-tight tracking-tight truncate flex-shrink-0"
          style={{ color: color.text }}
        >
          {ev.title}
        </p>

        {/* ── Badge pills (only when card is tall enough) ── */}
        {tall && (
          <div className="flex gap-1 mt-1 flex-wrap flex-shrink-0">
            {initials && (
              <span
                className="text-[9px] font-bold px-1.5 py-px rounded-full uppercase tracking-wide leading-tight"
                style={{ backgroundColor: `${color.bar}20`, color: color.bar }}
              >
                {initials}
              </span>
            )}
            {typeTag && (
              <span
                className="text-[9px] font-bold px-1.5 py-px rounded-full uppercase tracking-wide leading-tight"
                style={{ backgroundColor: `${color.bar}18`, color: color.bar }}
              >
                {typeTag}
              </span>
            )}
          </div>
        )}

        {/* ── Spacer pushes time footer to bottom ── */}
        <div className="flex-1 min-h-0" />

        {/* ── Time footer ── */}
        {!compact && (
          <p
            className="text-[9px] font-semibold tabular-nums leading-tight flex-shrink-0"
            style={{ color: color.text, opacity: 0.5 }}
          >
            {fmt12(ev.startTime)} – {fmt12(ev.endTime)}
          </p>
        )}
      </div>

      {/* ── Completed overlay ── */}
      {ev.completed && (
        <div className="absolute inset-0 bg-white/65 backdrop-blur-[1px] flex items-center justify-center">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
            style={{
              backgroundColor: "#dcfce7",
              color:           "#15803d",
              borderColor:     "#86efac",
            }}
          >
            ✓ Done
          </span>
        </div>
      )}

      {/* ── Subtle hover shimmer ── */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-r-xl"
        style={{ background: `linear-gradient(135deg, transparent 40%, ${color.bar}09 100%)` }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TimeGrid — Week / Day view
// ─────────────────────────────────────────────────────────────────────────────
function TimeGrid({ days, eventsMap, scrollRef, onEventClick }) {
  const todayStr = new Date().toLocaleDateString("en-CA");

  return (
    <div className="flex flex-col flex-1 overflow-hidden">

      {/* ── Sticky day-header row ── */}
      <div className="flex flex-shrink-0 border-b border-gray-100 bg-white z-10" style={{ boxShadow: "0 1px 0 #e5e7eb" }}>
        <div className="w-16 flex-shrink-0 border-r border-gray-100 bg-gray-50/60" />
        {days.map(day => {
          const ds        = dateStr(day);
          const isToday   = ds === todayStr;
          const hasEvents = (eventsMap[ds] || []).length > 0;
          return (
            <div
              key={ds}
              className={`flex-1 h-16 flex flex-col items-center justify-center border-r border-gray-100 last:border-r-0 transition-colors ${
                isToday ? "bg-indigo-50/70" : "bg-white"
              }`}
            >
              <span
                className={`text-[10px] font-bold tracking-[0.12em] uppercase mb-1 ${
                  isToday ? "text-indigo-500" : "text-gray-400"
                }`}
              >
                {fmtDayOfWeek(day)}
              </span>
              <span
                className={`text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                  isToday
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                    : "text-gray-800 hover:bg-gray-100"
                }`}
              >
                {day.getDate()}
              </span>
              {/* Event-presence dot */}
              {hasEvents && !isToday && (
                <div className="w-1 h-1 rounded-full bg-gray-300 mt-1" />
              )}
              {hasEvents && isToday && (
                <div className="w-1 h-1 rounded-full bg-indigo-400 mt-1" />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Scrollable body ── */}
      <div ref={scrollRef} className="flex flex-1 overflow-y-auto">

        {/* Time-label gutter */}
        <div
          className="w-16 flex-shrink-0 border-r border-gray-100 relative"
          style={{ height: TOTAL_H, minHeight: TOTAL_H, backgroundColor: "#fafafa" }}
        >
          {HOURS.map(h => (
            <div
              key={h}
              style={{
                position: "absolute",
                top:   Math.max(2, (h - HOUR_START) * HOUR_HEIGHT - 8),
                right: 10,
              }}
              className="text-[10px] font-medium text-gray-400 select-none tabular-nums tracking-wide"
            >
              {h < 12 ? `${h}:00` : h === 12 ? "12:00" : `${h - 12}:00`}
            </div>
          ))}
        </div>

        {/* Day columns */}
        <div className="flex flex-1">
          {days.map(day => {
            const ds      = dateStr(day);
            const isToday = ds === todayStr;
            const dayEvs  = computeLayout(eventsMap[ds] || []);

            // Current-time indicator
            const now     = new Date();
            const nowMins = now.getHours() * 60 + now.getMinutes();
            const nowY    = ((nowMins - HOUR_START * 60) / 60) * HOUR_HEIGHT;
            const showNow = isToday && nowY >= 0 && nowY <= TOTAL_H;

            return (
              <div
                key={ds}
                className="flex-1 relative border-r border-gray-100 last:border-r-0"
                style={{
                  height:         TOTAL_H,
                  minHeight:      TOTAL_H,
                  minWidth:       days.length > 1 ? 96 : undefined,
                  backgroundColor: isToday ? "rgba(238,242,255,0.35)" : undefined,
                }}
              >
                {/* Hour lines */}
                {HOURS.map(h => (
                  <div
                    key={h}
                    style={{ position: "absolute", top: (h - HOUR_START) * HOUR_HEIGHT, left: 0, right: 0, borderTop: "1px solid #f0f0f0" }}
                    className="pointer-events-none"
                  />
                ))}

                {/* Half-hour lines */}
                {HOURS.map(h => (
                  <div
                    key={`hh${h}`}
                    style={{
                      position: "absolute",
                      top:   (h - HOUR_START) * HOUR_HEIGHT + HOUR_HEIGHT / 2,
                      left:  0,
                      right: 0,
                      borderTop: "1px dashed #f4f4f5",
                    }}
                    className="pointer-events-none"
                  />
                ))}

                {/* Current-time red line — polished dot + line */}
                {showNow && (
                  <div
                    style={{ position: "absolute", top: nowY, left: 0, right: 0, zIndex: 5 }}
                    className="flex items-center pointer-events-none"
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 -ml-1.5"
                      style={{ backgroundColor: "#ef4444", boxShadow: "0 0 0 3px rgba(239,68,68,0.2)" }}
                    />
                    <div className="flex-1" style={{ borderTop: "2px solid #ef4444", opacity: 0.7 }} />
                  </div>
                )}

                {/* Event blocks */}
                {dayEvs.map(ev => (
                  <EventBlock
                    key={ev.id}
                    ev={ev}
                    style={{
                      top:    toY(ev.startTime) + 1,
                      height: toH(ev.startTime, ev.endTime) - 2,
                      left:   `calc(${(ev._col / ev._total) * 100}% + 2px)`,
                      width:  `calc(${(1 / ev._total) * 100}% - 4px)`,
                    }}
                    onClick={() => onEventClick(ev)}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AgendaView — 30-day rolling list grouped by date
// ─────────────────────────────────────────────────────────────────────────────
function AgendaView({ anchor, eventsMap, scrollRef, onEventClick }) {
  const todayStr   = new Date().toLocaleDateString("en-CA");
  const agendaDays = Array.from({ length: 30 }, (_, i) => addDays(anchor, i));
  const populated  = agendaDays.filter(d => (eventsMap[dateStr(d)] || []).length > 0);

  if (populated.length === 0) {
    return (
      <div ref={scrollRef} className="flex-1 flex items-center justify-center bg-gray-50/40">
        <div className="text-center px-8 py-12 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-sm">
          <div
            className="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center text-4xl"
            style={{ background: "linear-gradient(135deg,#eef2ff 0%,#e0e7ff 100%)" }}
          >
            📅
          </div>
          <h3 className="text-base font-bold text-gray-800 mb-1">No events scheduled</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            Your calendar is clear for the next 30 days.
            <br />Hit <span className="font-semibold text-indigo-500">+ Add Event</span> to schedule something.
          </p>
          <div className="flex justify-center gap-1.5 mt-5">
            {[0,1,2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6 space-y-8" style={{ backgroundColor: "#f8f9fb" }}>
      {populated.map(day => {
        const ds      = dateStr(day);
        const isToday = ds === todayStr;
        const evs     = [...(eventsMap[ds] || [])].sort((a, b) => toMins(a.startTime) - toMins(b.startTime));

        return (
          <div key={ds}>
            {/* ── Date header ── */}
            <div className="flex items-center gap-3 mb-3">
              <div
                className="flex flex-col items-center justify-center flex-shrink-0 w-12 h-12 rounded-2xl"
                style={isToday
                  ? { background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", boxShadow: "0 4px 12px rgba(99,102,241,0.35)" }
                  : { background: "#fff", color: "#374151", border: "1px solid #e5e7eb" }
                }
              >
                <span className="text-[9px] font-bold uppercase leading-none tracking-wide mb-0.5">
                  {day.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                <span className="text-base font-bold leading-none">{day.getDate()}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <p className="text-sm font-bold text-gray-800">
                    {day.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                  {isToday && (
                    <span className="text-[10px] font-bold px-1.5 py-px rounded-full bg-indigo-100 text-indigo-600 uppercase tracking-wider">
                      Today
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {evs.length} event{evs.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent max-w-xs" />
            </div>

            {/* ── Event cards ── */}
            <div className="ml-15 space-y-2.5">
              {evs.map(ev => {
                const color       = getColor(ev);
                const durationMin = toMins(ev.endTime) - toMins(ev.startTime);
                const durText     = durationMin >= 60
                  ? `${Math.floor(durationMin / 60)}h${durationMin % 60 > 0 ? ` ${durationMin % 60}m` : ""}`
                  : `${durationMin}m`;
                const typeTag = deriveTag(ev.title);

                return (
                  <div
                    key={ev.id}
                    onClick={() => onEventClick(ev)}
                    className="flex gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-200 hover:-translate-y-px group"
                    style={{
                      background:   color.grad,
                      borderLeft:   `4px solid ${color.bar}`,
                      boxShadow:    "0 1px 4px rgba(0,0,0,0.06)",
                    }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.10)"}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"}
                  >
                    {/* Time column */}
                    <div className="flex-shrink-0 w-16 text-right">
                      <p className="text-xs font-bold tabular-nums" style={{ color: color.bar }}>
                        {fmt12(ev.startTime)}
                      </p>
                      <p className="text-[10px] text-gray-400 tabular-nums">{fmt12(ev.endTime)}</p>
                      <p
                        className="text-[10px] font-semibold mt-1 px-1.5 py-px rounded-full text-center"
                        style={{ backgroundColor: `${color.bar}15`, color: color.bar }}
                      >
                        {durText}
                      </p>
                    </div>

                    {/* Divider */}
                    <div
                      className="w-px self-stretch rounded-full flex-shrink-0"
                      style={{ backgroundColor: color.bar, opacity: 0.2 }}
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 flex-wrap">
                        <p className="text-sm font-semibold leading-snug" style={{ color: color.text }}>
                          {ev.title}
                        </p>
                        {ev.completed && (
                          <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex-shrink-0">
                            ✓ Done
                          </span>
                        )}
                      </div>


                      {/* Badges */}
                      {typeTag && (
                        <div className="flex gap-1.5 mt-2">
                          <span
                            className="text-[9px] font-bold px-2 py-px rounded-full uppercase tracking-wide"
                            style={{ backgroundColor: `${color.bar}18`, color: color.bar }}
                          >
                            {typeTag}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EventDetailModal — click any event to open this
// ─────────────────────────────────────────────────────────────────────────────
function DetailRow({ icon, children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-base leading-5 flex-shrink-0">{icon}</span>
      <div className="text-sm text-gray-700 leading-5">{children}</div>
    </div>
  );
}

function EventDetailModal({ event: ev, onClose, onToggle, onDelete }) {
  const color       = getColor(ev);
  const durationMin = toMins(ev.endTime) - toMins(ev.startTime);
  const durText     = durationMin >= 60
    ? `${Math.floor(durationMin / 60)}h${durationMin % 60 > 0 ? ` ${durationMin % 60}m` : ""}`
    : `${durationMin}m`;

  // Spring entrance animation via RAF
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        backgroundColor: ready ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0)",
        backdropFilter:  ready ? "blur(2px)" : "none",
        transition:      "background-color 0.2s, backdrop-filter 0.2s",
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-sm overflow-hidden"
        style={{
          boxShadow:  "0 24px 48px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)",
          transform:  ready ? "scale(1) translateY(0)"  : "scale(0.94) translateY(12px)",
          opacity:    ready ? 1 : 0,
          transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.18s ease",
        }}
      >
        {/* ── Gradient header strip ── */}
        <div
          className="px-5 pt-5 pb-4"
          style={{ background: color.grad }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Colour dot + title */}
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color.bar }} />
                <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: color.bar }}>
                  Event
                </p>
              </div>
              <h3 className="text-[17px] font-bold text-gray-900 leading-snug">{ev.title}</h3>
              <p className="text-xs text-gray-500 mt-1">
                {parseDate(ev.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-gray-500 transition flex-shrink-0 mt-0.5 text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="h-px bg-gray-100" />

        <div className="px-5 py-4">
          {/* Detail rows */}
          <div className="space-y-3.5">
            <DetailRow icon="🕐">
              <span className="font-semibold text-gray-800">{fmt12(ev.startTime)} – {fmt12(ev.endTime)}</span>
              <span
                className="ml-2 text-[11px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${color.bar}15`, color: color.bar }}
              >
                {durText}
              </span>
            </DetailRow>

            {/* ── Divider ── */}
            <div className="h-px bg-gray-100 my-1" />

            <DetailRow icon={ev.completed ? "✅" : "⏳"}>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  ev.completed ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                }`}
              >
                {ev.completed ? "Completed" : "Pending"}
              </span>
            </DetailRow>
          </div>

          {/* ── Action buttons ── */}
          <div className="flex gap-2 mt-5">
            <button
              onClick={() => onToggle(ev)}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 active:scale-95"
              style={ev.completed
                ? { backgroundColor: "#f3f4f6", color: "#374151" }
                : { backgroundColor: color.bar, color: "#fff", boxShadow: `0 4px 12px ${color.bar}40` }
              }
            >
              {ev.completed ? "Mark Pending" : "Mark Complete"}
            </button>
            <button
              onClick={() => onDelete(ev.id)}
              className="px-4 py-2.5 rounded-xl text-sm font-bold bg-red-50 text-red-500 hover:bg-red-100 active:scale-95 transition-all duration-150"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AddEventModal — "+ Add Event" form with room + instructor
// ─────────────────────────────────────────────────────────────────────────────
function AddEventModal({ onSave, onClose }) {
  const [form,   setForm]   = useState({ title: "", date: "", startTime: "", endTime: "" });
  const [errors, setErrors] = useState({});

  const set = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())  e.title     = "Title is required.";
    if (!form.date)          e.date      = "Date is required.";
    if (!form.startTime)     e.startTime = "Start time is required.";
    if (!form.endTime)       e.endTime   = "End time is required.";
    else if (form.startTime && form.endTime <= form.startTime)
                             e.endTime   = "End time must be after start.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      title:     form.title.trim(),
      date:      form.date,
      startTime: form.startTime,
      endTime:   form.endTime,
    });
  };

  // Entrance animation
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        backgroundColor: ready ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0)",
        backdropFilter:  ready ? "blur(2px)" : "none",
        transition:      "background-color 0.2s, backdrop-filter 0.2s",
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden"
        style={{
          boxShadow:  "0 24px 48px rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.05)",
          transform:  ready ? "scale(1) translateY(0)"  : "scale(0.95) translateY(10px)",
          opacity:    ready ? 1 : 0,
          transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.18s ease",
        }}
      >
        {/* Modal header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)" }}
        >
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">New Event</h2>
            <p className="text-indigo-200 text-xs mt-0.5">Schedule a class, lecture, or session</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-lg leading-none transition"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Title */}
          <FormField label="Event Title" required error={errors.title}>
            <input
              type="text"
              placeholder="e.g. Software Engineering Lecture"
              value={form.title}
              onChange={e => set("title", e.target.value)}
              className={inputCls(errors.title)}
              autoFocus
            />
          </FormField>

          {/* Date */}
          <FormField label="Date" required error={errors.date}>
            <input
              type="date"
              value={form.date}
              onChange={e => set("date", e.target.value)}
              className={inputCls(errors.date)}
            />
          </FormField>

          {/* Start / End time */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Start Time" required error={errors.startTime}>
              <input
                type="time"
                value={form.startTime}
                onChange={e => set("startTime", e.target.value)}
                className={inputCls(errors.startTime)}
              />
            </FormField>
            <FormField label="End Time" required error={errors.endTime}>
              <input
                type="time"
                value={form.endTime}
                onChange={e => set("endTime", e.target.value)}
                className={inputCls(errors.endTime)}
              />
            </FormField>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm"
            >
              Add Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TimetableCalendar — main component (default export)
// ─────────────────────────────────────────────────────────────────────────────
export default function TimetableCalendar() {
  const [events,   setEvents]   = useState([]);
  const [view,     setView]     = useState("week");   // "week" | "day" | "agenda"
  const [anchor,   setAnchor]   = useState(new Date());
  const [selected, setSelected] = useState(null);     // event shown in detail modal
  const [showAdd,  setShowAdd]  = useState(false);
  const scrollRef = useRef(null);

  // ── Data fetching ────────────────────────────────────────────────────────
  const fetchEvents = useCallback(() => {
    authFetch("/events")
      .then(r => r.json())
      .then(data => {
        // Normalise dates so the lookup map always has "YYYY-MM-DD" keys
        setEvents(data.map(ev => ({ ...ev, date: normaliseDate(ev.date) })));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchEvents();
    window.addEventListener("studentbuddy:data-changed", fetchEvents);
    return () => window.removeEventListener("studentbuddy:data-changed", fetchEvents);
  }, [fetchEvents]);

  // ── Auto-scroll to current time when entering grid views ─────────────────
  useEffect(() => {
    if (view === "agenda" || !scrollRef.current) return;
    const now  = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    const y    = Math.max(0, ((mins - HOUR_START * 60) / 60) * HOUR_HEIGHT - 100);
    scrollRef.current.scrollTop = y;
  }, [view]);

  // ── Group events by date string ──────────────────────────────────────────
  const eventsMap = useMemo(() => {
    const m = {};
    events.forEach(ev => {
      if (!m[ev.date]) m[ev.date] = [];
      m[ev.date].push(ev);
    });
    return m;
  }, [events]);

  // ── Navigation ───────────────────────────────────────────────────────────
  const days    = view === "day" ? [anchor] : getWeekDays(anchor);
  const navPrev = () => setAnchor(a => addDays(a, view === "day" ? -1 : -7));
  const navNext = () => setAnchor(a => addDays(a, view === "day" ? 1 : 7));
  const goToday = () => setAnchor(new Date());

  function headerLabel() {
    if (view === "day") {
      return anchor.toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric", year: "numeric",
      });
    }
    if (view === "agenda") {
      return `Next 30 days from ${anchor.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    }
    const mon = startOfWeek(anchor);
    const sun = addDays(mon, 6);
    return mon.getMonth() === sun.getMonth()
      ? mon.toLocaleDateString("en-US", { month: "long", year: "numeric" })
      : `${mon.toLocaleDateString("en-US", { month: "short" })} – ${sun.toLocaleDateString("en-US", { month: "short", year: "numeric" })}`;
  }

  // ── Event mutations ──────────────────────────────────────────────────────
  const handleToggle = useCallback(ev => {
    const updated = { ...ev, completed: !ev.completed };
    setEvents(prev => prev.map(e => e.id === ev.id ? updated : e));
    setSelected(s => s?.id === ev.id ? updated : s);
    authFetch(`/events/${ev.id}`, {
      method: "PUT",
      body: JSON.stringify({ completed: updated.completed }),
    }).then(() => window.dispatchEvent(new CustomEvent("studentbuddy:data-changed")));
  }, []);

  const handleDelete = useCallback(id => {
    setEvents(prev => prev.filter(e => e.id !== id));
    setSelected(null);
    authFetch(`/events/${id}`, { method: "DELETE" })
      .then(() => window.dispatchEvent(new CustomEvent("studentbuddy:data-changed")));
  }, []);

  const handleSave = useCallback(formData => {
    const optimistic = { id: Date.now().toString(), ...formData, completed: false };
    authFetch("/events", { method: "POST", body: JSON.stringify(optimistic) })
      .then(r => r.json())
      .then(saved => {
        const normalised = { ...saved, date: normaliseDate(saved.date) };
        setEvents(prev => [...prev, normalised]);
      })
      .catch(() => {
        setEvents(prev => [...prev, optimistic]);
      });
    setShowAdd(false);
    window.dispatchEvent(new CustomEvent("studentbuddy:data-changed"));
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Top bar ── */}
      <div
        className="px-6 py-3 flex items-center gap-3 flex-shrink-0"
        style={{
          backgroundColor: "#fff",
          borderBottom:    "1px solid #e5e7eb",
          boxShadow:       "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        {/* Today button */}
        <button
          onClick={goToday}
          className="px-3.5 py-1.5 text-xs font-bold rounded-lg border transition-all duration-150 active:scale-95"
          style={{ borderColor: "#d1d5db", color: "#4b5563", backgroundColor: "#fff" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.color = "#6366f1"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#d1d5db"; e.currentTarget.style.color = "#4b5563"; }}
        >
          Today
        </button>

        {/* Prev / Next arrows */}
        <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={navPrev}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-gray-500 hover:text-gray-800 transition-all duration-150 text-base font-bold leading-none"
          >
            ‹
          </button>
          <button
            onClick={navNext}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-gray-500 hover:text-gray-800 transition-all duration-150 text-base font-bold leading-none"
          >
            ›
          </button>
        </div>

        {/* Header label */}
        <h2 className="text-lg font-bold text-gray-900 flex-1 select-none tracking-tight">
          {headerLabel()}
        </h2>

        {/* View toggle */}
        <div className="flex rounded-xl p-0.5 gap-0.5" style={{ backgroundColor: "#f1f3f5" }}>
          {[
            { key: "day",    label: "Day"    },
            { key: "week",   label: "Week"   },
            { key: "agenda", label: "Agenda" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className="px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all duration-150 active:scale-95"
              style={view === key
                ? { backgroundColor: "#fff", color: "#4f46e5", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
                : { backgroundColor: "transparent", color: "#6b7280" }
              }
            >
              {label}
            </button>
          ))}
        </div>

        {/* Add event */}
        <button
          onClick={() => setShowAdd(true)}
          className="text-white px-4 py-2 rounded-xl text-sm font-bold active:scale-95 transition-all duration-150"
          style={{
            background:  "linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)",
            boxShadow:   "0 4px 12px rgba(99,102,241,0.4)",
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 16px rgba(99,102,241,0.5)"}
          onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 12px rgba(99,102,241,0.4)"}
        >
          + Add Event
        </button>
      </div>

      {/* ── Calendar content ── */}
      <div className="flex-1 flex overflow-hidden bg-white">
        {view === "agenda" ? (
          <AgendaView
            anchor={anchor}
            eventsMap={eventsMap}
            scrollRef={scrollRef}
            onEventClick={setSelected}
          />
        ) : (
          <TimeGrid
            days={days}
            eventsMap={eventsMap}
            scrollRef={scrollRef}
            onEventClick={setSelected}
          />
        )}
      </div>

      {/* ── Event detail modal ── */}
      {selected && (
        <EventDetailModal
          event={selected}
          onClose={() => setSelected(null)}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      )}

      {/* ── Add event modal ── */}
      {showAdd && (
        <AddEventModal
          onSave={handleSave}
          onClose={() => setShowAdd(false)}
        />
      )}
    </>
  );
}
