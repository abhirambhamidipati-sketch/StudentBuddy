package com.studentbuddy.gui;

import com.studentbuddy.service.GoalService;
import com.studentbuddy.service.TaskService;
import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.layout.*;
import javafx.stage.Stage;

public class MainApp extends Application {

    @Override
    public void start(Stage stage) {

        TaskService taskService = new TaskService();
        taskService.loadFromFile();

        GoalService goalService = new GoalService();
        goalService.loadFromFile();

        TaskView taskView = new TaskView(taskService);
        GoalView goalView = new GoalView(goalService);

        Button taskBtn = new Button("Tasks");
        Button goalBtn = new Button("Goals");

        taskBtn.setStyle("-fx-background-color: #4CAF50; -fx-text-fill: white;");
        goalBtn.setStyle("-fx-background-color: #9B59B6; -fx-text-fill: white;");

        VBox sidebar = new VBox(20);
        sidebar.setPadding(new Insets(20));
        sidebar.setStyle("-fx-background-color: #2C3E50;");
        sidebar.getChildren().addAll(taskBtn, goalBtn);

        StackPane content = new StackPane();
        content.setStyle("-fx-background-color: #ECF0F1;");

        BorderPane root = new BorderPane();
        root.setLeft(sidebar);
        root.setCenter(content);

        taskBtn.setOnAction(e -> content.getChildren().setAll(taskView.getView()));
        goalBtn.setOnAction(e -> {
            goalService.saveToFile(); // save before switching
            content.getChildren().setAll(goalView.getView());
        });

        Scene scene = new Scene(root, 1000, 600);

        stage.setTitle("Student Buddy");
        stage.setScene(scene);
        stage.setOnCloseRequest(e -> {
            goalService.saveToFile();
        });
        stage.show();
    }

    public static void main(String[] args) {
        launch();
    }
}