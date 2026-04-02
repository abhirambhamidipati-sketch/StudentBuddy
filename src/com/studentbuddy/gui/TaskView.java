package com.studentbuddy.gui;

import com.studentbuddy.model.Task;
import com.studentbuddy.service.TaskService;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.geometry.Insets;
import javafx.scene.control.*;
import javafx.scene.layout.VBox;

import java.time.LocalDate;

public class TaskView {

    private TaskService taskService;
    private TableView<Task> table;

    public TaskView(TaskService taskService) {
        this.taskService = taskService;
    }

    public VBox getView() {

        table = new TableView<>();

        TableColumn<Task, String> titleCol = new TableColumn<>("Title");
        titleCol.setCellValueFactory(data ->
                new javafx.beans.property.SimpleStringProperty(data.getValue().getTitle()));

        TableColumn<Task, String> priorityCol = new TableColumn<>("Priority");
        priorityCol.setCellValueFactory(data ->
                new javafx.beans.property.SimpleStringProperty(data.getValue().getPriority()));

        TableColumn<Task, String> deadlineCol = new TableColumn<>("Deadline");
        deadlineCol.setCellValueFactory(data ->
                new javafx.beans.property.SimpleStringProperty(data.getValue().getDeadline().toString()));

        table.getColumns().addAll(titleCol, priorityCol, deadlineCol);

        refreshTable();

        Button addBtn = new Button("Add Task");
        addBtn.setStyle("-fx-background-color: #3498DB; -fx-text-fill: white;");

        Button deleteBtn = new Button("Delete Task");
        deleteBtn.setStyle("-fx-background-color: #E74C3C; -fx-text-fill: white;");

        addBtn.setOnAction(e -> showAddTaskDialog());
        deleteBtn.setOnAction(e -> deleteSelectedTask());

        VBox layout = new VBox(15);
        layout.setPadding(new Insets(20));
        layout.setStyle("-fx-background-color: white;");

        layout.getChildren().addAll(table, addBtn, deleteBtn);

        return layout;
    }

    private void refreshTable() {
        ObservableList<Task> data = FXCollections.observableArrayList(taskService.getTaskList());
        table.setItems(data);
    }

    private void showAddTaskDialog() {

        Dialog<Void> dialog = new Dialog<>();
        dialog.setTitle("Add Task");

        TextField titleField = new TextField();
        TextField descField = new TextField();

        DatePicker datePicker = new DatePicker();

        ComboBox<String> priorityBox = new ComboBox<>();
        priorityBox.getItems().addAll("High", "Medium", "Low");
        priorityBox.setValue("Medium");

        VBox box = new VBox(10,
                new Label("Title"), titleField,
                new Label("Description"), descField,
                new Label("Deadline"), datePicker,
                new Label("Priority"), priorityBox
        );

        box.setPadding(new Insets(15));

        dialog.getDialogPane().setContent(box);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);

        dialog.setResultConverter(button -> {
            if (button == ButtonType.OK) {

                if (titleField.getText().isEmpty() || datePicker.getValue() == null) {
                    showAlert("Please fill all required fields!");
                    return null;
                }

                taskService.addTask(
                        titleField.getText(),
                        descField.getText(),
                        datePicker.getValue(),
                        priorityBox.getValue()
                );

                refreshTable();
            }
            return null;
        });

        dialog.showAndWait();
    }

    private void deleteSelectedTask() {

        Task selected = table.getSelectionModel().getSelectedItem();

        if (selected != null) {
            taskService.deleteTask(selected.getTaskId());
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