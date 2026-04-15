package com.example.demo;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

/**
 * GET /analytics — returns a per-user analytics snapshot.
 *
 * Response shape:
 * {
 *   "taskCompletion": 75,   // % of tasks with status "done"
 *   "goalProgress":   60,   // average progress % across all goals
 *   "eventsToday":    3,    // total events scheduled for today
 *   "missedEvents":   1     // today's events that started in the past and aren't completed
 * }
 */
@RestController
@CrossOrigin
public class AnalyticsController {

    private final TaskRepository      taskRepo;
    private final GoalRepository      goalRepo;
    private final TimetableRepository timetableRepo;

    public AnalyticsController(TaskRepository taskRepo,
                                GoalRepository goalRepo,
                                TimetableRepository timetableRepo) {
        this.taskRepo      = taskRepo;
        this.goalRepo      = goalRepo;
        this.timetableRepo = timetableRepo;
    }

    private String currentUser() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping("/analytics")
    public Map<String, Object> getAnalytics() {
        String userId = currentUser();

        // ── Task completion ───────────────────────────────────────────────────
        List<Task> tasks = taskRepo.findByUser_Id(userId);
        long doneTasks = tasks.stream().filter(t -> "done".equals(t.getStatus())).count();
        int taskCompletion = tasks.isEmpty() ? 0 : (int)(doneTasks * 100L / tasks.size());

        // ── Goal progress (average) ───────────────────────────────────────────
        List<Goal> goals = goalRepo.findByUser_Id(userId);
        int goalProgress = goals.isEmpty() ? 0 :
            (int) goals.stream()
                .mapToInt(g -> g.getProgress() != null ? g.getProgress() : 0)
                .average()
                .orElse(0);

        // ── Today's events ───────────────────────────────────────────────────
        LocalDate today       = LocalDate.now();
        LocalTime now         = LocalTime.now();
        List<Timetable> todayEvents = timetableRepo.findByUser_IdAndDate(userId, today);
        int eventsToday = todayEvents.size();

        // ── Missed events — started before now and not completed ──────────────
        long missedEvents = todayEvents.stream().filter(e -> {
            if (e.getStartTime() == null)            return false;
            if (Boolean.TRUE.equals(e.getCompleted())) return false;
            try {
                return LocalTime.parse(e.getStartTime()).isBefore(now);
            } catch (Exception ex) {
                return false;
            }
        }).count();

        return Map.of(
            "taskCompletion", taskCompletion,
            "goalProgress",   goalProgress,
            "eventsToday",    eventsToday,
            "missedEvents",   (int) missedEvents
        );
    }
}
