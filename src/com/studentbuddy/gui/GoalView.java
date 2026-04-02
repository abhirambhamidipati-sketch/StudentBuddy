package com.studentbuddy.gui;

import com.studentbuddy.model.Goal;
import com.studentbuddy.service.GoalService;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.geometry.Insets;
import javafx.scene.control.*;
import javafx.scene.layout.VBox;

import java.time.LocalDate;

public class GoalView {

    private GoalService goalService;
    private TableView<Goal> table;

    public GoalView(GoalService goalService) {
        this.goalService = goalService;
    }

    public VBox getView() {

        table = new TableView<>();

        TableColumn<Goal, String> nameCol = new TableColumn<>("Goal");
        nameCol.setCellValueFactory(data ->
                new javafx.beans.property.SimpleStringProperty(data.getValue().getGoalName()));

        TableColumn<Goal, String> dateCol = new TableColumn<>("Target Date");
        dateCol.setCellValueFactory(data ->
                new javafx.beans.property.SimpleStringProperty(data.getValue().getTargetDate().toString()));

        TableColumn<Goal, String> progressCol = new TableColumn<>("Progress");
        progressCol.setCellValueFactory(data ->
                new javafx.beans.property.SimpleStringProperty(data.getValue().getProgress() + "%"));

        table.getColumns().addAll(nameCol, dateCol, progressCol);

        refreshTable();

        Button addBtn = new Button("Add Goal");
        addBtn.setStyle("-fx-background-color: #3498DB; -fx-text-fill: white;");

        Button updateBtn = new Button("Update Progress");
        updateBtn.setStyle("-fx-background-color: #F39C12; -fx-text-fill: white;");

        Button deleteBtn = new Button("Delete Goal");
        deleteBtn.setStyle("-fx-background-color: #E74C3C; -fx-text-fill: white;");

        addBtn.setOnAction(e -> showAddGoalDialog());
        updateBtn.setOnAction(e -> updateProgress());
        deleteBtn.setOnAction(e -> deleteGoal());

        VBox layout = new VBox(15);
        layout.setPadding(new Insets(20));
        layout.setStyle("-fx-background-color: white;");

        layout.getChildren().addAll(table, addBtn, updateBtn, deleteBtn);

        return layout;
    }

    private void refreshTable() {
        ObservableList<Goal> data = FXCollections.observableArrayList(goalService.getGoalList());
        table.setItems(data);
    }

    private void showAddGoalDialog() {

        Dialog<Void> dialog = new Dialog<>();
        dialog.setTitle("Add Goal");

        TextField nameField = new TextField();
        DatePicker datePicker = new DatePicker();

        VBox box = new VBox(10,
                new Label("Goal Name"), nameField,
                new Label("Target Date"), datePicker
        );

        box.setPadding(new Insets(15));

        dialog.getDialogPane().setContent(box);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);

        dialog.setResultConverter(button -> {
            if (button == ButtonType.OK) {

                if (nameField.getText().isEmpty() || datePicker.getValue() == null) {
                    showAlert("Please fill all fields!");
                    return null;
                }

                goalService.addGoal(nameField.getText(), datePicker.getValue());
                refreshTable();
            }
            return null;
        });

        dialog.showAndWait();
    }

    private void updateProgress() {

        Goal selected = table.getSelectionModel().getSelectedItem();

        if (selected == null) {
            showAlert("Select a goal first!");
            return;
        }

        TextInputDialog dialog = new TextInputDialog();
        dialog.setTitle("Update Progress");
        dialog.setHeaderText("Enter progress (0-100)");

        dialog.showAndWait().ifPresent(input -> {
            try {
                int progress = Integer.parseInt(input);
                goalService.updateGoalProgress(selected.getGoalId(), progress);
                refreshTable();
            } catch (Exception e) {
                showAlert("Invalid input!");
            }
        });
    }

    private void deleteGoal() {

        Goal selected = table.getSelectionModel().getSelectedItem();

        if (selected != null) {
            goalService.deleteGoal(selected.getGoalId());
            refreshTable();
        }
    }

    private void showAlert(String message) {
        Alert alert = new Alert(Alert.AlertType.WARNING);
        alert.setTitle("Warning");
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }
}