package com.studentbuddy.reminder;

import com.studentbuddy.model.Task;
import com.studentbuddy.model.Goal;

import java.time.LocalDate;
import java.util.List;

public class ReminderService {

    public void checkTaskReminders(List<Task> tasks) {

        for (Task task : tasks) {

            if (!task.isCompleted()
                    && task.getDeadline().equals(LocalDate.now().plusDays(1))) {

                System.out.println("⚠ Reminder: Task \"" +
                        task.getTitle() +
                        "\" is due tomorrow.");
            }
        }
    }

    public void checkGoalReminders(List<Goal> goals) {

        for (Goal goal : goals) {

            if (goal.getProgressPercentage() < 100
                    && goal.getTargetDate().isBefore(LocalDate.now().plusDays(3))) {

                System.out.println("⚠ Reminder: Goal \"" +
                        goal.getGoalName() +
                        "\" deadline approaching.");
            }
        }
    }
}