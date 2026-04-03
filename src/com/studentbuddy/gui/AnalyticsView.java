package com.studentbuddy.gui;

import com.studentbuddy.model.Task;
import com.studentbuddy.service.TaskService;
import javafx.geometry.Insets;
import javafx.scene.control.Label;
import javafx.scene.layout.VBox;

import java.util.List;

public class AnalyticsView {

    private TaskService taskService;

    public AnalyticsView(TaskService taskService) {
        this.taskService = taskService;
    }

    public VBox getView() {

        List<Task> tasks = taskService.getTaskList();

        int total = tasks.size();
        int completed = 0;
        int pending = 0;

        for (Task t : tasks) {
            if (t.isCompleted()) {
                completed++;
            } else {
                pending++;
            }
        }

        Label title = new Label("Task Analytics");
        title.setStyle("-fx-font-size: 20px; -fx-font-weight: bold;");

        Label totalLabel = new Label("Total Tasks: " + total);
        Label completedLabel = new Label("Completed: " + completed);
        Label pendingLabel = new Label("Pending: " + pending);

        // Simple visual bar (text-based)
        Label bar = new Label(generateBar(completed, total));
        bar.setStyle("-fx-font-family: monospace;");

        VBox layout = new VBox(15);
        layout.setPadding(new Insets(20));
        layout.setStyle("-fx-background-color: white;");

        layout.getChildren().addAll(title, totalLabel, completedLabel, pendingLabel, bar);

        return layout;
    }

    private String generateBar(int completed, int total) {

        if (total == 0) return "No data";

        int percent = (completed * 100) / total;
        int bars = percent / 5;

        StringBuilder sb = new StringBuilder();

        sb.append("Progress: [");

        for (int i = 0; i < bars; i++) sb.append("█");
        for (int i = bars; i < 20; i++) sb.append("-");

        sb.append("] ").append(percent).append("%");

        return sb.toString();
    }
}