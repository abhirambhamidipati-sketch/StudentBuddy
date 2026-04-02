package com.studentbuddy.service;

import com.studentbuddy.model.Task;

import java.io.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class TaskService implements DataService {

    private List<Task> taskList = new ArrayList<>();
    private int taskCounter = 1;

    public void addTask(String title, String description, LocalDate deadline, String priority) {

        Task task = new Task(taskCounter++, title, description, deadline, priority);

        taskList.add(task);

        System.out.println("Task added successfully!");
    }

    public void viewTasks() {

        if (taskList.isEmpty()) {

            System.out.println("No tasks available.");
            return;
        }

        for (Task task : taskList) {

            System.out.println(task);
        }
    }

    public void markTaskCompleted(int taskId) {

        for (Task task : taskList) {

            if (task.getTaskId() == taskId) {

                task.markCompleted();
                System.out.println("Task marked as completed!");
                return;
            }
        }

        System.out.println("Task not found.");
    }

    public void deleteTask(int taskId) {

        taskList.removeIf(task -> task.getTaskId() == taskId);

        System.out.println("If task existed, it has been removed.");
    }

    public void showTaskStatistics() {

        int completed = 0;
        int pending = 0;

        for (Task task : taskList) {

            if (task.isCompleted()) {
                completed++;
            } else {
                pending++;
            }
        }

        System.out.println("\n----- Task Dashboard -----");
        System.out.println("Total Tasks: " + taskList.size());
        System.out.println("Completed: " + completed);
        System.out.println("Pending: " + pending);
    }

    public void searchTasks(String keyword) {

        boolean found = false;

        for (Task task : taskList) {

            if (task.getTitle().toLowerCase().contains(keyword.toLowerCase())
                    || task.getDescription().toLowerCase().contains(keyword.toLowerCase())) {

                System.out.println(task);
                found = true;
            }
        }

        if (!found) {
            System.out.println("No tasks found matching the keyword.");
        }
    }

    public void sortTasksByDeadline() {

        taskList.sort((t1, t2) -> t1.getDeadline().compareTo(t2.getDeadline()));

        System.out.println("Tasks sorted by deadline.");
    }

    public void sortTasksByPriority() {

        taskList.sort((t1, t2) -> getPriorityValue(t1.getPriority()) - getPriorityValue(t2.getPriority()));

        System.out.println("Tasks sorted by priority (High → Medium → Low).");
    }

    private int getPriorityValue(String priority) {

        if (priority.equalsIgnoreCase("High")) return 1;
        if (priority.equalsIgnoreCase("Medium")) return 2;
        if (priority.equalsIgnoreCase("Low")) return 3;

        return 4;
    }

    public void showOverdueTasks() {

        boolean found = false;

        for (Task task : taskList) {

            if (!task.isCompleted() && task.getDeadline().isBefore(LocalDate.now())) {

                System.out.println(task);
                found = true;
            }
        }

        if (!found) {
            System.out.println("No overdue tasks.");
        }
    }

    public List<Task> getTaskList() {
        return taskList;
    }

    public void saveToFile() {

        try (ObjectOutputStream out =
                     new ObjectOutputStream(new FileOutputStream("tasks.dat"))) {

            out.writeObject(taskList);

        } catch (IOException e) {

            System.out.println("Error saving tasks.");
        }
    }

    @SuppressWarnings("unchecked")
    public void loadFromFile() {

        try (ObjectInputStream in =
                     new ObjectInputStream(new FileInputStream("tasks.dat"))) {

            taskList = (List<Task>) in.readObject();

            if (!taskList.isEmpty()) {

                taskCounter = taskList.get(taskList.size() - 1).getTaskId() + 1;
            }

        } catch (IOException | ClassNotFoundException e) {

            System.out.println("No existing tasks data.");
        }
    }
}