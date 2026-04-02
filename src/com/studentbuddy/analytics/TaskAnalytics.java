package com.studentbuddy.analytics;

import com.studentbuddy.model.Task;

import java.time.LocalDate;
import java.util.List;

public class TaskAnalytics {

    private List<Task> taskList;

    public TaskAnalytics(List<Task> taskList) {
        this.taskList = taskList;
    }

    public int getTotalTasks() {
        return taskList.size();
    }

    public int getCompletedTasks() {

        int count = 0;

        for (Task task : taskList) {

            if (task.isCompleted()) {
                count++;
            }
        }

        return count;
    }

    public int getPendingTasks() {

        int count = 0;

        for (Task task : taskList) {

            if (!task.isCompleted()) {
                count++;
            }
        }

        return count;
    }

    public int getOverdueTasks() {

        int count = 0;

        for (Task task : taskList) {

            if (!task.isCompleted() && task.getDeadline().isBefore(LocalDate.now())) {
                count++;
            }
        }

        return count;
    }

    public double getCompletionRate() {

        int total = getTotalTasks();

        if (total == 0) {
            return 0;
        }

        int completed = getCompletedTasks();

        return ((double) completed / total) * 100;
    }

    public void printAnalyticsReport() {

        System.out.println("\n===== TASK ANALYTICS REPORT =====");

        System.out.println("Total Tasks: " + getTotalTasks());

        System.out.println("Completed Tasks: " + getCompletedTasks());

        System.out.println("Pending Tasks: " + getPendingTasks());

        System.out.println("Overdue Tasks: " + getOverdueTasks());

        System.out.printf("Completion Rate: %.2f%%\n", getCompletionRate());

        System.out.println("===============================\n");
    }
}