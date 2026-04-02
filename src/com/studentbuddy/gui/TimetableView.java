package com.studentbuddy.gui;

import com.studentbuddy.model.Timetable;
import com.studentbuddy.service.TimetableService;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.geometry.Insets;
import javafx.scene.control.*;
import javafx.scene.layout.VBox;

public class TimetableView {

    private TimetableService timetableService;
    private TableView<Timetable> table;

    public TimetableView(TimetableService timetableService) {
        this.timetableService = timetableService;
    }

    public VBox getView() {

        table = new TableView<>();

        TableColumn<Timetable, String> subjectCol = new TableColumn<>("Subject");
        subjectCol.setCellValueFactory(data ->
                new javafx.beans.property.SimpleStringProperty(data.getValue().getSubject()));

        TableColumn<Timetable, String> dayCol = new TableColumn<>("Day");
        dayCol.setCellValueFactory(data ->
                new javafx.beans.property.SimpleStringProperty(data.getValue().getDay()));

        TableColumn<Timetable, String> timeCol = new TableColumn<>("Time");
        timeCol.setCellValueFactory(data ->
                new javafx.beans.property.SimpleStringProperty(
                        data.getValue().getStartTime() + " - " + data.getValue().getEndTime()
                ));

        table.getColumns().addAll(subjectCol, dayCol, timeCol);

        refreshTable();

        Button addBtn = new Button("Add Entry");
        addBtn.setStyle("-fx-background-color: #3498DB; -fx-text-fill: white;");

        Button deleteBtn = new Button("Delete Entry");
        deleteBtn.setStyle("-fx-background-color: #E74C3C; -fx-text-fill: white;");

        addBtn.setOnAction(e -> showAddDialog());
        deleteBtn.setOnAction(e -> deleteEntry());

        VBox layout = new VBox(15);
        layout.setPadding(new Insets(20));
        layout.setStyle("-fx-background-color: white;");

        layout.getChildren().addAll(table, addBtn, deleteBtn);

        return layout;
    }

    private void refreshTable() {
        ObservableList<Timetable> data =
                FXCollections.observableArrayList(timetableService.getTimetableList());
        table.setItems(data);
    }

    private void showAddDialog() {

        Dialog<Void> dialog = new Dialog<>();
        dialog.setTitle("Add Timetable Entry");

        TextField subjectField = new TextField();

        ComboBox<String> dayBox = new ComboBox<>();
        dayBox.getItems().addAll("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday");
        dayBox.setValue("Monday");

        TextField startField = new TextField();
        TextField endField = new TextField();

        VBox box = new VBox(10,
                new Label("Subject"), subjectField,
                new Label("Day"), dayBox,
                new Label("Start Time"), startField,
                new Label("End Time"), endField
        );

        box.setPadding(new Insets(15));

        dialog.getDialogPane().setContent(box);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);

        dialog.setResultConverter(button -> {
            if (button == ButtonType.OK) {

                if (subjectField.getText().isEmpty()) {
                    showAlert("Fill all fields!");
                    return null;
                }

                timetableService.addEntry(
                        subjectField.getText(),
                        dayBox.getValue(),
                        startField.getText(),
                        endField.getText()
                );

                refreshTable();
            }
            return null;
        });

        dialog.showAndWait();
    }

    private void deleteEntry() {

        Timetable selected = table.getSelectionModel().getSelectedItem();

        if (selected != null) {
            timetableService.deleteEntry(selected.getId());
            refreshTable();
        }
    }

    private void showAlert(String msg) {
        Alert alert = new Alert(Alert.AlertType.WARNING);
        alert.setContentText(msg);
        alert.showAndWait();
    }
}