package com.studentbuddy.gui;

import com.studentbuddy.model.Timetable;
import com.studentbuddy.service.TimetableService;
import javafx.collections.*;
import javafx.geometry.Insets;
import javafx.scene.control.*;
import javafx.scene.layout.VBox;

import java.time.*;

public class TimetableView {

    private TimetableService service;
    private TableView<Timetable> table;

    public TimetableView(TimetableService service) {
        this.service = service;
    }

    public VBox getView() {

        table = new TableView<>();

        TableColumn<Timetable, String> eventCol = new TableColumn<>("Event");
        eventCol.setCellValueFactory(d -> new javafx.beans.property.SimpleStringProperty(d.getValue().getEvent()));

        TableColumn<Timetable, String> dateCol = new TableColumn<>("Date");
        dateCol.setCellValueFactory(d -> new javafx.beans.property.SimpleStringProperty(d.getValue().getDate().toString()));

        TableColumn<Timetable, String> timeCol = new TableColumn<>("Time");
        timeCol.setCellValueFactory(d -> new javafx.beans.property.SimpleStringProperty(
                d.getValue().getStartTime() + " - " + d.getValue().getEndTime()
        ));

        TableColumn<Timetable, Boolean> doneCol = new TableColumn<>("Done");
        doneCol.setCellValueFactory(d -> new javafx.beans.property.SimpleBooleanProperty(d.getValue().isCompleted()));

        doneCol.setCellFactory(col -> new TableCell<>() {
            private final CheckBox checkBox = new CheckBox();

            {
                checkBox.setOnAction(e -> {
                    Timetable item = getTableView().getItems().get(getIndex());
                    service.toggleComplete(item.getId());
                    refresh();
                });
            }

            @Override
            protected void updateItem(Boolean item, boolean empty) {
                super.updateItem(item, empty);
                if (empty) setGraphic(null);
                else {
                    checkBox.setSelected(item);
                    setGraphic(checkBox);
                }
            }
        });

        table.getColumns().addAll(eventCol, dateCol, timeCol, doneCol);

        refresh();

        Button addBtn = new Button("Add Event");
        addBtn.setOnAction(e -> showDialog());

        VBox layout = new VBox(15, table, addBtn);
        layout.setPadding(new Insets(20));

        return layout;
    }

    private void refresh() {
        table.setItems(FXCollections.observableArrayList(service.getTimetableList()));
    }

    private void showDialog() {

        Dialog<Void> dialog = new Dialog<>();
        dialog.setTitle("Add Event");

        TextField eventField = new TextField();

        DatePicker datePicker = new DatePicker(LocalDate.now());

        Spinner<Integer> startHour = new Spinner<>(0, 23, 10);
        Spinner<Integer> startMin = new Spinner<>(0, 59, 0);

        Spinner<Integer> endHour = new Spinner<>(0, 23, 11);
        Spinner<Integer> endMin = new Spinner<>(0, 59, 0);

        VBox box = new VBox(10,
                new Label("Event"), eventField,
                new Label("Date"), datePicker,
                new Label("Start Time (HH MM)"), startHour, startMin,
                new Label("End Time (HH MM)"), endHour, endMin
        );

        dialog.getDialogPane().setContent(box);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.OK, ButtonType.CANCEL);

        dialog.setResultConverter(btn -> {
            if (btn == ButtonType.OK) {

                LocalTime start = LocalTime.of(startHour.getValue(), startMin.getValue());
                LocalTime end = LocalTime.of(endHour.getValue(), endMin.getValue());

                if (end.isBefore(start)) {
                    return null;
                }

                service.addEntry(
                        eventField.getText(),
                        datePicker.getValue(),
                        start,
                        end
                );

                refresh();
            }
            return null;
        });

        dialog.showAndWait();
    }
}