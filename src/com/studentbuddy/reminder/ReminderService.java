package com.studentbuddy.reminder;

import com.studentbuddy.model.Timetable;
import com.studentbuddy.service.TimetableService;
import javafx.application.Platform;
import javafx.scene.control.Alert;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;

public class ReminderService {

    private TimetableService timetableService;
    private Set<Integer> notifiedEvents = new HashSet<>();

    public ReminderService(TimetableService timetableService) {
        this.timetableService = timetableService;
    }

    public void start() {

        Thread thread = new Thread(() -> {

            while (true) {

                try {
                    Thread.sleep(60000); // check every 1 min
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }

                checkReminders();
            }
        });

        thread.setDaemon(true);
        thread.start();
    }

    private void checkReminders() {

        LocalDateTime now = LocalDateTime.now();

        for (Timetable t : timetableService.getTimetableList()) {

            if (t.isCompleted()) continue;

            LocalDateTime eventTime = t.getDate().atTime(t.getStartTime());

            long minutes = java.time.Duration.between(now, eventTime).toMinutes();

            if (minutes >= 0 && minutes <= 5 && !notifiedEvents.contains(t.getId())) {

                notifiedEvents.add(t.getId());

                Platform.runLater(() -> showAlert(t));
            }
        }
    }

    private void showAlert(Timetable t) {

        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle("Reminder");
        alert.setHeaderText("Upcoming Event!");
        alert.setContentText(
                t.getEvent() + "\nStarts at: " + t.getStartTime()
        );

        alert.show();
    }
}