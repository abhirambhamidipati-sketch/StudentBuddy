package com.example.demo;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Checks today's timetable events every 60 seconds and pushes
 * Notification objects to each user's personal WebSocket topic.
 *
 * UPCOMING — event starts within the next 0–5 minutes.
 * MISSED   — event started in the past and was never marked completed.
 *
 * Delivery: SimpMessagingTemplate.convertAndSend("/topic/reminders/{userId}", ...)
 *   If the user's browser is disconnected, the message is silently dropped —
 *   acceptable behaviour for transient reminder toasts.
 *
 * Deduplication: a per-day Set tracks which (eventId:type) keys have already
 *   been sent; cleared at midnight by a separate @Scheduled job.
 */
@Service
public class ReminderService {

    private final TimetableRepository    timetableRepo;
    private final SimpMessagingTemplate  messagingTemplate;

    /**
     * Tracks event IDs that have already triggered a notification of a given type
     * within the current day.  Format: "<eventId>:upcoming" | "<eventId>:missed".
     * Thread-safe via ConcurrentHashMap.newKeySet().
     */
    private final Set<String> notifiedKeys = ConcurrentHashMap.newKeySet();

    public ReminderService(TimetableRepository timetableRepo,
                           SimpMessagingTemplate messagingTemplate) {
        this.timetableRepo     = timetableRepo;
        this.messagingTemplate = messagingTemplate;
    }

    // ── Scheduled jobs ────────────────────────────────────────────────────────

    /** Runs every 60 s — checks all of today's events and pushes reminders. */
    @Scheduled(fixedRate = 60_000)
    public void checkReminders() {
        LocalDate today = LocalDate.now();
        LocalTime now   = LocalTime.now();

        List<Timetable> todayEvents = timetableRepo.findByDate(today);

        for (Timetable event : todayEvents) {
            if (event.getStartTime() == null) continue;

            String userId = event.getUserId();
            if (userId == null) continue;

            LocalTime eventTime;
            try {
                eventTime = LocalTime.parse(event.getStartTime());   // "HH:MM"
            } catch (Exception e) {
                continue;
            }

            // UPCOMING: event starts in 0–5 minutes from now
            long minutesUntil = ChronoUnit.MINUTES.between(now, eventTime);
            if (minutesUntil >= 0 && minutesUntil <= 5) {
                String key = event.getId() + ":upcoming";
                if (notifiedKeys.add(key)) {
                    String msg = minutesUntil == 0
                        ? "Starting now: " + event.getTitle()
                        : "Upcoming: " + event.getTitle() + " starts in " + minutesUntil + " min";
                    push(userId, new Notification("UPCOMING", msg, event.getId()));
                }
            }

            // MISSED: event start time has passed and it is not marked completed
            boolean completed = Boolean.TRUE.equals(event.getCompleted());
            if (eventTime.isBefore(now) && !completed) {
                String key = event.getId() + ":missed";
                if (notifiedKeys.add(key)) {
                    push(userId, new Notification(
                        "MISSED",
                        "Missed: " + event.getTitle() + " was at " + event.getStartTime(),
                        event.getId()));
                }
            }
        }
    }

    /** Clears the deduplication set at midnight so each day starts fresh. */
    @Scheduled(cron = "0 0 0 * * *")
    public void resetDailyNotifications() {
        notifiedKeys.clear();
    }

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Kept for backward compatibility with GET /reminders.
     * Now always returns an empty list — delivery is via WebSocket push.
     */
    public List<Notification> drainNotifications(String userId) {
        return List.of();
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /** Pushes a notification directly to the user's personal STOMP topic. */
    private void push(String userId, Notification n) {
        messagingTemplate.convertAndSend("/topic/reminders/" + userId, n);
    }
}
