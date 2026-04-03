package com.studentbuddy.gui;

import com.studentbuddy.service.*;
import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.layout.*;
import javafx.stage.Stage;
import com.studentbuddy.reminder.ReminderService;

public class MainApp extends Application {

    @Override
    public void start(Stage stage) {

        TaskService taskService = new TaskService();
        taskService.loadFromFile();

        GoalService goalService = new GoalService();
        goalService.loadFromFile();

        TimetableService timetableService = new TimetableService();
        timetableService.loadFromFile();

        ReminderService reminderService = new ReminderService(timetableService);
        reminderService.start();

        TaskView taskView = new TaskView(taskService);
        GoalView goalView = new GoalView(goalService);
        TimetableView timetableView = new TimetableView(timetableService);
        AnalyticsView analyticsView = new AnalyticsView(taskService);

        Button taskBtn = new Button("Tasks");
        Button goalBtn = new Button("Goals");
        Button timetableBtn = new Button("Timetable");
        Button analyticsBtn = new Button("Analytics");

        taskBtn.setStyle("-fx-background-color: #4CAF50; -fx-text-fill: white;");
        goalBtn.setStyle("-fx-background-color: #9B59B6; -fx-text-fill: white;");
        timetableBtn.setStyle("-fx-background-color: #E67E22; -fx-text-fill: white;");
        analyticsBtn.setStyle("-fx-background-color: #34495E; -fx-text-fill: white;");

        VBox sidebar = new VBox(20);
        sidebar.setPadding(new Insets(20));
        sidebar.setStyle("-fx-background-color: #2C3E50;");
        sidebar.getChildren().addAll(taskBtn, goalBtn, timetableBtn, analyticsBtn);

        StackPane content = new StackPane();
        content.setStyle("-fx-background-color: #ECF0F1;");

        BorderPane root = new BorderPane();
        root.setLeft(sidebar);
        root.setCenter(content);

        taskBtn.setOnAction(e -> content.getChildren().setAll(taskView.getView()));
        goalBtn.setOnAction(e -> content.getChildren().setAll(goalView.getView()));
        timetableBtn.setOnAction(e -> content.getChildren().setAll(timetableView.getView()));
        analyticsBtn.setOnAction(e -> content.getChildren().setAll(analyticsView.getView()));

        stage.setOnCloseRequest(e -> {
            goalService.saveToFile();
            timetableService.saveToFile();
            taskService.saveToFile();
        });

        Scene scene = new Scene(root, 1000, 600);

        stage.setTitle("Student Buddy");
        stage.setScene(scene);
        stage.show();
    }

    public static void main(String[] args) {
        launch();
    }
}