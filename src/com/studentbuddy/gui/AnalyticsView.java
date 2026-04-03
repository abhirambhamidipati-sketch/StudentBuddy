package com.studentbuddy.gui;

import com.studentbuddy.model.Task;
import com.studentbuddy.service.TaskService;
import javafx.collections.FXCollections;
import javafx.geometry.Insets;
import javafx.scene.chart.*;
import javafx.scene.layout.VBox;

import java.util.List;

public class AnalyticsView {

    private TaskService taskService;

    public AnalyticsView(TaskService taskService) {
        this.taskService = taskService;
    }

    public VBox getView() {

        List<Task> tasks = taskService.getTaskList();

        int completed = 0;
        int pending = 0;

        for (Task t : tasks) {
            if (t.isCompleted()) completed++;
            else pending++;
        }

        // 🔥 PIE CHART
        PieChart pieChart = new PieChart();
        pieChart.setTitle("Task Completion");

        pieChart.setData(FXCollections.observableArrayList(
                new PieChart.Data("Completed", completed),
                new PieChart.Data("Pending", pending)
        ));

        // 🔥 BAR CHART
        CategoryAxis xAxis = new CategoryAxis();
        NumberAxis yAxis = new NumberAxis();

        BarChart<String, Number> barChart = new BarChart<>(xAxis, yAxis);
        barChart.setTitle("Task Distribution");

        XYChart.Series<String, Number> series = new XYChart.Series<>();
        series.setName("Tasks");

        series.getData().add(new XYChart.Data<>("Completed", completed));
        series.getData().add(new XYChart.Data<>("Pending", pending));

        barChart.getData().add(series);

        VBox layout = new VBox(20, pieChart, barChart);
        layout.setPadding(new Insets(20));
        layout.setStyle("-fx-background-color: white;");

        return layout;
    }
}