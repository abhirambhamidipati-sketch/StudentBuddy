package com.studentbuddy.gui;

import com.studentbuddy.service.*;
import com.studentbuddy.reminder.ReminderService;
import javafx.application.Application;
import javafx.scene.Scene;
import javafx.scene.layout.BorderPane;
import javafx.stage.Stage;

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

        DashboardView dashboard = new DashboardView(taskService, goalService, timetableService);

        BorderPane root = new BorderPane();
        root.setCenter(dashboard.getView());

        Scene scene = new Scene(root, 1100, 700);

        stage.setTitle("Student Buddy");
        stage.setScene(scene);
        stage.show();
    }

    public static void main(String[] args) {
        launch();
    }
}