package com.studentbuddy.gui;

import com.studentbuddy.service.*;
import javafx.geometry.Insets;
import javafx.scene.control.Label;
import javafx.scene.layout.VBox;
import javafx.scene.control.ScrollPane;

public class DashboardView {

    private TaskService taskService;
    private GoalService goalService;
    private TimetableService timetableService;

    public DashboardView(TaskService t, GoalService g, TimetableService tt) {
        this.taskService = t;
        this.goalService = g;
        this.timetableService = tt;
    }

    public ScrollPane getView() {

        VBox container = new VBox(30);
        container.setPadding(new Insets(20));

        // Sections
        TaskView taskView = new TaskView(taskService);
        GoalView goalView = new GoalView(goalService);
        TimetableView timetableView = new TimetableView(timetableService);
        AnalyticsView analyticsView = new AnalyticsView(taskService, goalService, timetableService);

        Label taskTitle = new Label("Tasks");
        Label goalTitle = new Label("Goals");
        Label timetableTitle = new Label("Timetable");
        Label analyticsTitle = new Label("Analytics");

        taskTitle.setStyle("-fx-font-size: 18px; -fx-font-weight: bold;");
        goalTitle.setStyle("-fx-font-size: 18px; -fx-font-weight: bold;");
        timetableTitle.setStyle("-fx-font-size: 18px; -fx-font-weight: bold;");
        analyticsTitle.setStyle("-fx-font-size: 18px; -fx-font-weight: bold;");

        container.getChildren().addAll(
                taskTitle, taskView.getView(),
                goalTitle, goalView.getView(),
                timetableTitle, timetableView.getView(),
                analyticsTitle, analyticsView.getView()
        );

        ScrollPane scroll = new ScrollPane(container);
        scroll.setFitToWidth(true);

        return scroll;
    }
}