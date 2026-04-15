package com.example.demo;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Rule-based NLP chatbot for StudentBuddy.
 *
 * Supported intents:
 *   ADD TASK    — "add task <title>" / "create task <title>" / "new task <title>"
 *   COMPLETE    — "complete task <title>" / "done task <title>" / "finish task <title>"
 *                 Exact match is tried first; falls back to partial match.
 *                 When multiple partial matches exist, a numbered list is returned
 *                 and the user can reply "complete task #1" to pick one.
 *   VIEW TASKS  — "view tasks" / "show tasks" / "list tasks" / "my tasks"
 *                 Optional status filter: "todo", "doing", "done"
 *   VIEW GOALS  — "view goals" / "show goals" / "list goals" / "my goals"
 *   ANALYTICS   — "analytics" / "progress" / "summary" / "stats"
 *   HELP        — fallback for unrecognised input
 */
@Service
public class ChatService {

    private final TaskRepository  taskRepo;
    private final GoalRepository  goalRepo;
    private final UserRepository  userRepo;

    /**
     * Stores the last ambiguous match list per user so that a follow-up
     * "complete task #N" can resolve it.  Entries are cleared on successful
     * completion or when a new COMPLETE intent is evaluated.
     */
    private final ConcurrentHashMap<String, List<Task>> pendingSelection =
        new ConcurrentHashMap<>();

    public ChatService(TaskRepository taskRepo,
                       GoalRepository goalRepo,
                       UserRepository userRepo) {
        this.taskRepo = taskRepo;
        this.goalRepo = goalRepo;
        this.userRepo = userRepo;
    }

    public String handleMessage(String message, String userId) {
        if (message == null || message.isBlank()) return helpMessage();

        String lower = message.toLowerCase().trim();

        // ── NUMBERED SELECTION (#N) ──────────────────────────────────────────
        // Handles "complete task #1", "#2", "1", etc. after a multi-match reply.
        if (hasPendingSelection(userId) && looksLikeSelection(lower)) {
            return applySelection(lower, userId);
        }

        // ── ADD TASK ─────────────────────────────────────────────────────────
        if (lower.startsWith("add task")    ||
            lower.startsWith("create task") ||
            lower.startsWith("new task")) {

            String title = extractAfter(message, "add task", "create task", "new task");
            if (title.isBlank()) {
                return "Please include a title. Example: add task Study for OOPs exam";
            }
            Task task = new Task();
            task.setId(UUID.randomUUID().toString());
            task.setTitle(title);
            task.setStatus("todo");
            task.setUser(userRepo.getReferenceById(userId));
            taskRepo.save(task);
            pendingSelection.remove(userId);
            return "Task added: \"" + title + "\"";
        }

        // ── COMPLETE TASK ────────────────────────────────────────────────────
        if (lower.startsWith("complete task") ||
            lower.startsWith("done task")     ||
            lower.startsWith("finish task")   ||
            lower.startsWith("mark task")) {

            String raw = extractAfter(message,
                "complete task", "done task", "finish task", "mark task");
            // Strip common leading modifiers ("done", "as done", "completed")
            String title = raw
                .replaceFirst("(?i)^(as done|done|completed|as complete)\\s*", "")
                .trim();

            if (title.isBlank()) {
                return "Please include the task name. Example: complete task Study for OOPs exam";
            }
            return resolveAndComplete(title, userId);
        }

        // ── VIEW TASKS ───────────────────────────────────────────────────────
        if (lower.contains("view tasks")  ||
            lower.contains("show tasks")  ||
            lower.contains("list tasks")  ||
            lower.contains("my tasks")) {

            List<Task> all = taskRepo.findByUser_Id(userId);
            if (all.isEmpty()) {
                return "You have no tasks yet. Try: add task Study for OOPs exam";
            }

            // Optional status filter
            String filterMutable = null;
            if      (lower.contains("to do")  || lower.contains("todo")  || lower.contains("pending")) filterMutable = "todo";
            else if (lower.contains("doing")  || lower.contains("in progress"))                         filterMutable = "doing";
            else if (lower.contains("done")   || lower.contains("completed"))                           filterMutable = "done";

            final String filter = filterMutable;   // effectively final for lambda

            List<Task> shown = (filter != null)
                ? all.stream().filter(t -> filter.equals(t.getStatus())).collect(Collectors.toList())
                : all;

            if (shown.isEmpty()) {
                return "No tasks with status \"" + filter + "\".";
            }
            StringBuilder sb = new StringBuilder();
            sb.append("Your tasks (").append(shown.size()).append("):\n");
            shown.forEach(t ->
                sb.append("• [").append(t.getStatus()).append("] ").append(t.getTitle()).append("\n"));
            return sb.toString().trim();
        }

        // ── VIEW GOALS ───────────────────────────────────────────────────────
        if (lower.contains("view goals") ||
            lower.contains("show goals") ||
            lower.contains("list goals") ||
            lower.contains("my goals")) {

            List<Goal> goals = goalRepo.findByUser_Id(userId);
            if (goals.isEmpty()) {
                return "You have no goals yet.";
            }
            StringBuilder sb = new StringBuilder();
            sb.append("Your goals (").append(goals.size()).append("):\n");
            goals.forEach(g -> {
                int pct = g.getProgress() != null ? g.getProgress() : 0;
                sb.append("• ").append(g.getName())
                  .append(" — ").append(pct).append("% complete");
                if (g.getTargetDate() != null) {
                    sb.append(" (due ").append(g.getTargetDate()).append(")");
                }
                sb.append("\n");
            });
            return sb.toString().trim();
        }

        // ── ANALYTICS ────────────────────────────────────────────────────────
        if (lower.contains("analytics") ||
            lower.contains("progress")  ||
            lower.contains("summary")   ||
            lower.contains("stats")) {

            List<Task> tasks = taskRepo.findByUser_Id(userId);
            List<Goal> goals = goalRepo.findByUser_Id(userId);

            long done    = tasks.stream().filter(t -> "done".equals(t.getStatus())).count();
            int  taskPct = tasks.isEmpty() ? 0 : (int)(done * 100L / tasks.size());

            int avgGoal = goals.isEmpty() ? 0 :
                (int) goals.stream()
                    .mapToInt(g -> g.getProgress() != null ? g.getProgress() : 0)
                    .average()
                    .orElse(0);

            return "Your progress summary:\n" +
                "• Tasks: " + done + "/" + tasks.size() + " done (" + taskPct + "%)\n" +
                "• Goals: " + goals.size() + " active, avg " + avgGoal + "% progress";
        }

        // ── HELP / FALLBACK ──────────────────────────────────────────────────
        return helpMessage();
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /**
     * Resolves a COMPLETE intent with exact-then-partial matching.
     *
     * Priority:
     *  1. Exact case-insensitive title match   → complete immediately
     *  2. Exactly one partial match            → complete immediately
     *  3. Multiple partial matches             → return numbered list, store in pendingSelection
     *  4. No match                             → "No task found"
     */
    private String resolveAndComplete(String title, String userId) {
        List<Task> tasks = taskRepo.findByUser_Id(userId);

        // 1. Exact match
        Task exact = tasks.stream()
            .filter(t -> t.getTitle().equalsIgnoreCase(title))
            .findFirst()
            .orElse(null);

        if (exact != null) {
            return markDone(exact, userId);
        }

        // 2 & 3. Partial matches
        List<Task> partial = tasks.stream()
            .filter(t -> t.getTitle().toLowerCase().contains(title.toLowerCase()))
            .collect(Collectors.toList());

        if (partial.isEmpty()) {
            pendingSelection.remove(userId);
            return "No task found matching: \"" + title + "\"";
        }
        if (partial.size() == 1) {
            return markDone(partial.get(0), userId);
        }

        // Multiple matches — ask the user to choose
        pendingSelection.put(userId, new ArrayList<>(partial));
        StringBuilder sb = new StringBuilder("Multiple tasks found:\n");
        for (int i = 0; i < partial.size(); i++) {
            sb.append(i + 1).append(". ").append(partial.get(i).getTitle()).append("\n");
        }
        sb.append("Reply: complete task #1  (or the number you want)");
        return sb.toString().trim();
    }

    /** Applies a stored numbered selection from a previous multi-match response. */
    private String applySelection(String lower, String userId) {
        List<Task> pending = pendingSelection.get(userId);
        if (pending == null || pending.isEmpty()) {
            return helpMessage();
        }
        // Extract digits from input (handles "#1", "complete task #2", "1", "2", …)
        String digits = lower.replaceAll("[^0-9]", "");
        if (digits.isEmpty()) {
            return "Please reply with a number, e.g. complete task #1";
        }
        try {
            int idx = Integer.parseInt(digits) - 1;
            if (idx < 0 || idx >= pending.size()) {
                return "Please enter a number between 1 and " + pending.size() + ".";
            }
            return markDone(pending.get(idx), userId);
        } catch (NumberFormatException e) {
            return "Please reply with a number, e.g. complete task #1";
        }
    }

    private String markDone(Task task, String userId) {
        task.setStatus("done");
        taskRepo.save(task);
        pendingSelection.remove(userId);
        return "Marked as done: \"" + task.getTitle() + "\"";
    }

    private boolean hasPendingSelection(String userId) {
        List<Task> list = pendingSelection.get(userId);
        return list != null && !list.isEmpty();
    }

    /**
     * Returns true when the message looks like a numbered selection:
     *   "#1", "1", "complete task #2", etc.
     */
    private static boolean looksLikeSelection(String lower) {
        return lower.matches("^#?\\d+$") ||
               lower.matches("^(complete task|complete|done task|finish task)\\s+#\\d+$");
    }

    private static String helpMessage() {
        return "I can help you with:\n" +
            "• add task <title>\n" +
            "• view tasks  (or: view todo tasks / view done tasks)\n" +
            "• complete task <title>\n" +
            "• complete task #1  (after a multi-match reply)\n" +
            "• view goals\n" +
            "• analytics";
    }

    /**
     * Returns the text that follows the first matching keyword prefix.
     * Comparison is case-insensitive; returned text preserves original case.
     */
    private static String extractAfter(String message, String... keywords) {
        String lower = message.toLowerCase();
        for (String kw : keywords) {
            if (lower.startsWith(kw)) {
                return message.substring(kw.length()).trim();
            }
        }
        return "";
    }
}
