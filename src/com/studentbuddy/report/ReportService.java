package com.studentbuddy.report;

import com.studentbuddy.model.*;
import java.io.FileWriter;
import java.util.List;

public class ReportService {

    public void generateReport(List<Task> tasks, List<Goal> goals, List<Timetable> timetable) {

        try (FileWriter writer = new FileWriter("report.txt")) {

            writer.write("=== STUDENT BUDDY REPORT ===\n\n");

            writer.write("TASKS:\n");
            for (Task t : tasks) writer.write(t + "\n");

            writer.write("\nGOALS:\n");
            for (Goal g : goals) writer.write(g + "\n");

            writer.write("\nTIMETABLE:\n");
            for (Timetable t : timetable) writer.write(t + "\n");

            writer.write("\n=== END ===");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}