package com.studentbuddy.service;

import com.studentbuddy.model.Goal;

import java.io.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class GoalService {

    private List<Goal> goalList = new ArrayList<>();
    private int goalCounter = 1;

    private static final String FILE_NAME = "goals.dat";

    public void addGoal(String goalName, LocalDate targetDate) {
        Goal goal = new Goal(goalCounter++, goalName, targetDate);
        goalList.add(goal);
        System.out.println("Goal added successfully!");
    }

    public void viewGoals() {
        if (goalList.isEmpty()) {
            System.out.println("No goals available.");
            return;
        }

        for (Goal goal : goalList) {
            System.out.println(goal);
        }
    }

    public void updateGoalProgress(int goalId, int progress) {
        for (Goal goal : goalList) {
            if (goal.getGoalId() == goalId) {
                goal.updateProgress(progress);
                System.out.println("Goal progress updated!");
                return;
            }
        }
        System.out.println("Goal not found.");
    }

    public void deleteGoal(int goalId) {
        goalList.removeIf(goal -> goal.getGoalId() == goalId);
        System.out.println("Goal deleted successfully!");
    }

    public List<Goal> getGoalList() {
        return goalList;
    }

    // 🔥 SAVE TO FILE
    public void saveToFile() {
        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(FILE_NAME))) {
            oos.writeObject(goalList);
        } catch (IOException e) {
            System.out.println("Error saving goals.");
        }
    }

    // 🔥 LOAD FROM FILE
    public void loadFromFile() {
        try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(FILE_NAME))) {
            goalList = (List<Goal>) ois.readObject();

            // Fix counter after loading
            goalCounter = goalList.size() + 1;

        } catch (Exception e) {
            goalList = new ArrayList<>();
        }
    }
}