package com.studentbuddy.gui;

import com.studentbuddy.model.Goal;
import com.studentbuddy.model.Task;
import com.studentbuddy.model.Timetable;
import com.studentbuddy.service.GoalService;
import com.studentbuddy.service.TaskService;
import com.studentbuddy.service.TimetableService;
import javafx.collections.FXCollections;
import javafx.geometry.Insets;
import javafx.scene.chart.*;
import javafx.scene.control.Label;
import javafx.scene.layout.VBox;

import java.time.LocalDate;
import java.util.List;

public class AnalyticsView {

    private TaskService taskService;
    private GoalService goalService;
    private TimetableService timetableService;

    public AnalyticsView(TaskService t, GoalService g, TimetableService tt) {
        this.taskService = t;
        this.goalService = g;
        this.timetableService = tt;
    }

    public VBox getView() {

        List<Task> tasks = taskService.getTaskList();
        List<Goal> goals = goalService.getGoalList();
        List<Timetable> timetable = timetableService.getTimetableList();

        int completed = 0;
        int pending = 0;

        for (Task t : tasks) {
            if (t.isCompleted()) completed++;
            else pending++;
        }

        // 🔥 PIE CHART
        PieChart pie = new PieChart(FXCollections.observableArrayList(
                new PieChart.Data("Completed", completed),
                new PieChart.Data("Pending", pending)
        ));

        pie.setTitle("Task Completion");

        // 🔥 PRODUCTIVITY SCORE
        int taskScore = tasks.size() == 0 ? 0 : (completed * 100 / tasks.size());

        int goalTotal = 0;
        for (Goal g : goals) goalTotal += g.getProgress();
        int goalScore = goals.size() == 0 ? 0 : goalTotal / goals.size();

        int productivity = (taskScore + goalScore) / 2;

        Label scoreLabel = new Label("Productivity Score: " + productivity + "%");
        scoreLabel.setStyle("-fx-font-size: 18px; -fx-font-weight: bold;");

        // 🔥 TIMETABLE INSIGHT
        int todayEvents = 0;

        for (Timetable t : timetable) {
            if (t.getDate().equals(LocalDate.now())) {
                todayEvents++;
            }
        }

        Label timetableLabel = new Label("Today's Events: " + todayEvents);

        VBox layout = new VBox(20, scoreLabel, timetableLabel, pie);
        layout.setPadding(new Insets(20));
        layout.setStyle("-fx-background-color: white;");

        return layout;
    }
}