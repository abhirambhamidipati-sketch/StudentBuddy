package com.studentbuddy.model;

import java.time.LocalDate;
import java.io.Serializable;

public class Task implements Serializable {

    private int taskId;
    private String title;
    private String description;
    private LocalDate deadline;
    private String priority;
    private boolean isCompleted;

    public Task(int taskId, String title, String description, LocalDate deadline, String priority) {
        this.taskId = taskId;
        this.title = title;
        this.description = description;
        this.deadline = deadline;
        this.priority = priority;
        this.isCompleted = false;
    }

    public int getTaskId() {
        return taskId;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public String getPriority() {
        return priority;
    }

    public boolean isCompleted() {
        return isCompleted;
    }

    public void markCompleted() {
        this.isCompleted = true;
    }

    @Override
    public String toString() {
        return "\nTask ID: " + taskId +
                "\nTitle: " + title +
                "\nDescription: " + description +
                "\nDeadline: " + deadline +
                "\nPriority: " + priority +
                "\nStatus: " + (isCompleted ? "Completed" : "Pending") +
                "\n---------------------------";
    }
}
