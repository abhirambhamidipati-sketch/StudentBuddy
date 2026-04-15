package com.example.demo;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * GET /reminders — returns and drains the pending notification queue
 * for the authenticated user.  Frontend polls this every 30 s.
 *
 * Response: [ { "type": "UPCOMING", "message": "...", "eventId": "..." }, ... ]
 * Returns an empty array [] when there are no pending notifications.
 */
@RestController
@CrossOrigin
public class ReminderController {

    private final ReminderService reminderService;

    public ReminderController(ReminderService reminderService) {
        this.reminderService = reminderService;
    }

    private String currentUser() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping("/reminders")
    public List<Notification> getReminders() {
        return reminderService.drainNotifications(currentUser());
    }
}
