package com.studentbuddy.gui;

import com.studentbuddy.service.*;
import javafx.geometry.Insets;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.VBox;

public class DashboardView {

    private TaskService taskService;
    private GoalService goalService;
    private TimetableService timetableService;

    public DashboardView(TaskService t, GoalService g, TimetableService tt) {
        this.taskService = t;
        this.goalService = g;
        this.timetableService = tt;
    }

    public GridPane getView() {

        TaskView taskView = new TaskView(taskService);
        GoalView goalView = new GoalView(goalService);
        TimetableView timetableView = new TimetableView(timetableService);
        AnalyticsView analyticsView = new AnalyticsView(taskService, goalService, timetableService);

        VBox taskCard = createCard(taskView.getView());
        VBox goalCard = createCard(goalView.getView());
        VBox timetableCard = createCard(timetableView.getView());
        VBox analyticsCard = createCard(analyticsView.getView());

        GridPane grid = new GridPane();
        grid.setPadding(new Insets(20));
        grid.setHgap(20);
        grid.setVgap(20);

        // 2x2 layout
        grid.add(taskCard, 0, 0);
        grid.add(goalCard, 1, 0);
        grid.add(timetableCard, 0, 1);
        grid.add(analyticsCard, 1, 1);

        // Make cards responsive
        grid.setPrefSize(1000, 700);

        return grid;
    }

    private VBox createCard(javafx.scene.Node content) {

        VBox card = new VBox(content);
        card.setPadding(new Insets(15));
        card.setStyle("""
                -fx-background-color: white;
                -fx-background-radius: 12;
                -fx-effect: dropshadow(gaussian, rgba(0,0,0,0.1), 10, 0, 0, 4);
                """);

        return card;
    }
}