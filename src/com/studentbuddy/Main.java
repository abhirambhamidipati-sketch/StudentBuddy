package com.studentbuddy;

import com.studentbuddy.service.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.Scanner;

public class Main {

    public static void main(String[] args) {

        Scanner scanner = new Scanner(System.in);

        TaskService taskService = new TaskService();
        taskService.loadFromFile();

        GoalService goalService = new GoalService();
        goalService.loadFromFile();

        TimetableService timetableService = new TimetableService();
        timetableService.loadFromFile();

        boolean running = true;

        while (running) {

            System.out.println("\n===== Student Buddy =====");
            System.out.println("1. Add Task");
            System.out.println("2. View Tasks");
            System.out.println("3. Mark Task Completed");
            System.out.println("4. Delete Task");
            System.out.println("5. Add Goal");
            System.out.println("6. View Goals");
            System.out.println("7. Update Goal Progress");
            System.out.println("8. Delete Goal");
            System.out.println("9. Add Timetable Event");
            System.out.println("10. View Timetable");
            System.out.println("11. Mark Timetable Completed");
            System.out.println("12. Delete Timetable Event");
            System.out.println("13. Exit");

            System.out.print("Choose: ");
            int choice = scanner.nextInt();
            scanner.nextLine();

            try {

                switch (choice) {

                    case 1:
                        System.out.print("Title: ");
                        String title = scanner.nextLine();

                        System.out.print("Description: ");
                        String desc = scanner.nextLine();

                        System.out.print("Deadline (YYYY-MM-DD): ");
                        LocalDate deadline = LocalDate.parse(scanner.nextLine());

                        System.out.print("Priority: ");
                        String priority = scanner.nextLine();

                        taskService.addTask(title, desc, deadline, priority);
                        break;

                    case 2:
                        taskService.viewTasks();
                        break;

                    case 3:
                        System.out.print("Task ID: ");
                        taskService.markTaskCompleted(scanner.nextInt());
                        break;

                    case 4:
                        System.out.print("Task ID: ");
                        taskService.deleteTask(scanner.nextInt());
                        break;

                    case 5:
                        System.out.print("Goal name: ");
                        String goalName = scanner.nextLine();

                        System.out.print("Target date (YYYY-MM-DD): ");
                        LocalDate target = LocalDate.parse(scanner.nextLine());

                        goalService.addGoal(goalName, target);
                        break;

                    case 6:
                        goalService.viewGoals();
                        break;

                    case 7:
                        System.out.print("Goal ID: ");
                        int gid = scanner.nextInt();

                        System.out.print("Progress: ");
                        int prog = scanner.nextInt();

                        goalService.updateGoalProgress(gid, prog);
                        break;

                    case 8:
                        System.out.print("Goal ID: ");
                        goalService.deleteGoal(scanner.nextInt());
                        break;

                    case 9:
                        System.out.print("Event: ");
                        String event = scanner.nextLine();

                        System.out.print("Date (YYYY-MM-DD): ");
                        LocalDate date = LocalDate.parse(scanner.nextLine());

                        System.out.print("Start time (HH:MM): ");
                        LocalTime start = LocalTime.parse(scanner.nextLine());

                        System.out.print("End time (HH:MM): ");
                        LocalTime end = LocalTime.parse(scanner.nextLine());

                        timetableService.addEntry(event, date, start, end);
                        break;

                    case 10:
                        for (var t : timetableService.getTimetableList()) {
                            System.out.println(t);
                        }
                        break;

                    case 11:
                        System.out.print("Event ID: ");
                        timetableService.toggleComplete(scanner.nextInt());
                        break;

                    case 12:
                        System.out.print("Event ID: ");
                        timetableService.deleteEntry(scanner.nextInt());
                        break;

                    case 13:
                        taskService.saveToFile();
                        goalService.saveToFile();
                        timetableService.saveToFile();

                        running = false;
                        System.out.println("Exiting...");
                        break;

                    default:
                        System.out.println("Invalid option");
                }

            } catch (DateTimeParseException e) {
                System.out.println("Invalid date/time format.");
            }
        }

        scanner.close();
    }
}