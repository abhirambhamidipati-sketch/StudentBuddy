package com.studentbuddy.report;

import com.studentbuddy.model.Task;
import com.studentbuddy.model.Goal;
import com.studentbuddy.model.Timetable;
import com.studentbuddy.analytics.TaskAnalytics;
import com.studentbuddy.analytics.GoalAnalytics;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.util.List;

public class ReportGenerator {

    public static void generateReport(
            List<Task> tasks,
            List<Goal> goals,
            List<Timetable> timetableEntries) {

        try (BufferedWriter writer =
                     new BufferedWriter(new FileWriter("productivity_report.txt"))) {

            TaskAnalytics taskAnalytics = new TaskAnalytics(tasks);
            GoalAnalytics goalAnalytics = new GoalAnalytics(goals);

            writer.write("===== STUDENT PRODUCTIVITY REPORT =====");
            writer.newLine();
            writer.newLine();

            writer.write("----- TASK ANALYTICS -----");
            writer.newLine();
            writer.write("Total Tasks: " + taskAnalytics.getTotalTasks());
            writer.newLine();
            writer.write("Completed Tasks: " + taskAnalytics.getCompletedTasks());
            writer.newLine();
            writer.write("Pending Tasks: " + taskAnalytics.getPendingTasks());
            writer.newLine();
            writer.write("Overdue Tasks: " + taskAnalytics.getOverdueTasks());
            writer.newLine();
            writer.write(String.format("Completion Rate: %.2f%%",
                    taskAnalytics.getCompletionRate()));
            writer.newLine();
            writer.newLine();

            writer.write("----- GOAL ANALYTICS -----");
            writer.newLine();
            writer.write("Total Goals: " + goalAnalytics.getTotalGoals());
            writer.newLine();
            writer.write("Completed Goals: " + goalAnalytics.getCompletedGoals());
            writer.newLine();
            writer.write(String.format("Average Progress: %.2f%%",
                    goalAnalytics.getAverageProgress()));
            writer.newLine();
            writer.write("Goals Near Deadline: " + goalAnalytics.getGoalsNearDeadline());
            writer.newLine();
            writer.newLine();

            writer.write("----- TIMETABLE -----");
            writer.newLine();

            for (Timetable entry : timetableEntries) {
                writer.write(entry.toString());
                writer.newLine();
            }

            writer.newLine();
            writer.write("===== END OF REPORT =====");

            System.out.println("Productivity report generated successfully.");

        } catch (IOException e) {

            System.out.println("Error generating report.");
        }
    }
}