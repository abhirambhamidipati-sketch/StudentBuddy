package com.studentbuddy;

import com.studentbuddy.service.TaskService;
import com.studentbuddy.service.GoalService;
import com.studentbuddy.service.TimetableService;
import com.studentbuddy.analytics.TaskAnalytics;
import com.studentbuddy.analytics.GoalAnalytics;
import com.studentbuddy.report.ReportGenerator;
import com.studentbuddy.reminder.ReminderService;
import com.studentbuddy.auth.AuthService;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Scanner;

public class Main {

    public static void main(String[] args) {

        Scanner scanner = new Scanner(System.in);

        AuthService authService = new AuthService();

        boolean authenticated = false;

        while (!authenticated) {

            System.out.println("\n===== STUDENT BUDDY AUTH =====");
            System.out.println("1. Register");
            System.out.println("2. Login");

            int choice = scanner.nextInt();
            scanner.nextLine();

            if (choice == 1) {

                System.out.print("Enter Name: ");
                String name = scanner.nextLine();

                System.out.print("Enter Email: ");
                String email = scanner.nextLine();

                System.out.print("Enter Password: ");
                String password = scanner.nextLine();

                authService.register(name, email, password);

            } else if (choice == 2) {

                System.out.print("Enter Email: ");
                String email = scanner.nextLine();

                System.out.print("Enter Password: ");
                String password = scanner.nextLine();

                authenticated = authService.login(email, password);
            }
        }

        TaskService taskService = new TaskService();
        taskService.loadFromFile();

        GoalService goalService = new GoalService();
        goalService.loadFromFile();

        TimetableService timetableService = new TimetableService();
        timetableService.loadFromFile();

        ReminderService reminderService = new ReminderService();

        reminderService.checkTaskReminders(taskService.getTaskList());
        reminderService.checkGoalReminders(goalService.getGoalList());

        boolean running = true;

        while (running) {

            System.out.println("\n===== Student Buddy =====");
            System.out.println("1. Add Task");
            System.out.println("2. View Tasks");
            System.out.println("3. Mark Task Completed");
            System.out.println("4. Delete Task");
            System.out.println("5. Task Dashboard");
            System.out.println("6. Search Tasks");
            System.out.println("7. Sort Tasks by Deadline");
            System.out.println("8. Sort Tasks by Priority");
            System.out.println("9. View Overdue Tasks");
            System.out.println("10. Add Goal");
            System.out.println("11. View Goals");
            System.out.println("12. Update Goal Progress");
            System.out.println("13. Delete Goal");
            System.out.println("14. Add Timetable Entry");
            System.out.println("15. View Timetable");
            System.out.println("16. Delete Timetable Entry");
            System.out.println("17. View Task Analytics");
            System.out.println("18. View Goal Analytics");
            System.out.println("19. Generate Productivity Report");
            System.out.println("20. Logout");

            System.out.print("Choose an option: ");

            int choice = scanner.nextInt();
            scanner.nextLine();

            switch (choice) {

                case 1:

                    try {

                        System.out.print("Enter Task Title: ");
                        String title = scanner.nextLine();

                        System.out.print("Enter Description: ");
                        String description = scanner.nextLine();

                        System.out.print("Enter Deadline (YYYY-MM-DD): ");
                        LocalDate deadline = LocalDate.parse(scanner.nextLine());

                        System.out.print("Enter Priority (High/Medium/Low): ");
                        String priority = scanner.nextLine();

                        taskService.addTask(title, description, deadline, priority);

                    } catch (DateTimeParseException e) {

                        System.out.println("Invalid date format.");
                    }

                    break;

                case 2:
                    taskService.viewTasks();
                    break;

                case 3:

                    System.out.print("Enter Task ID: ");
                    taskService.markTaskCompleted(scanner.nextInt());
                    break;

                case 4:

                    System.out.print("Enter Task ID to delete: ");
                    taskService.deleteTask(scanner.nextInt());
                    break;

                case 5:
                    taskService.showTaskStatistics();
                    break;

                case 6:

                    System.out.print("Enter keyword: ");
                    String keyword = scanner.nextLine();

                    taskService.searchTasks(keyword);
                    break;

                case 7:
                    taskService.sortTasksByDeadline();
                    break;

                case 8:
                    taskService.sortTasksByPriority();
                    break;

                case 9:
                    taskService.showOverdueTasks();
                    break;

                case 10:

                    try {

                        System.out.print("Enter Goal Name: ");
                        String goalName = scanner.nextLine();

                        System.out.print("Enter Target Date (YYYY-MM-DD): ");
                        LocalDate targetDate = LocalDate.parse(scanner.nextLine());

                        goalService.addGoal(goalName, targetDate);

                    } catch (DateTimeParseException e) {

                        System.out.println("Invalid date format.");
                    }

                    break;

                case 11:
                    goalService.viewGoals();
                    break;

                case 12:

                    System.out.print("Enter Goal ID: ");
                    int goalId = scanner.nextInt();

                    System.out.print("Enter Progress (0-100): ");
                    int progress = scanner.nextInt();

                    goalService.updateGoalProgress(goalId, progress);
                    break;

                case 13:

                    System.out.print("Enter Goal ID to delete: ");
                    goalService.deleteGoal(scanner.nextInt());
                    break;

                case 14:

                    System.out.print("Enter Subject Name: ");
                    String subject = scanner.nextLine();

                    System.out.print("Enter Day: ");
                    String day = scanner.nextLine();

                    System.out.print("Enter Start Time: ");
                    String start = scanner.nextLine();

                    System.out.print("Enter End Time: ");
                    String end = scanner.nextLine();

                    timetableService.addEntry(subject, day, start, end);
                    break;

                case 15:
                    timetableService.viewTimetable();
                    break;

                case 16:

                    System.out.print("Enter Timetable ID: ");
                    timetableService.deleteEntry(scanner.nextInt());
                    break;

                case 17:

                    TaskAnalytics taskAnalytics =
                            new TaskAnalytics(taskService.getTaskList());

                    taskAnalytics.printAnalyticsReport();
                    break;

                case 18:

                    GoalAnalytics goalAnalytics =
                            new GoalAnalytics(goalService.getGoalList());

                    goalAnalytics.printGoalReport();
                    break;

                case 19:

                    ReportGenerator.generateReport(
                            taskService.getTaskList(),
                            goalService.getGoalList(),
                            timetableService.getTimetableList());

                    break;

                case 20:

                    authService.logout();

                    running = false;

                    break;

                default:

                    System.out.println("Invalid option.");
            }
        }

        scanner.close();
    }
}