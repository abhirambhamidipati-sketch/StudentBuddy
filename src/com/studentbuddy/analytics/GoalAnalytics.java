package com.studentbuddy.analytics;

import com.studentbuddy.model.Goal;

import java.time.LocalDate;
import java.util.List;

public class GoalAnalytics {

    private List<Goal> goalList;

    public GoalAnalytics(List<Goal> goalList) {
        this.goalList = goalList;
    }

    public int getTotalGoals() {
        return goalList.size();
    }

    public int getCompletedGoals() {

        int count = 0;

        for (Goal goal : goalList) {

            if (goal.getProgressPercentage() == 100) {
                count++;
            }
        }

        return count;
    }

    public double getAverageProgress() {

        if (goalList.isEmpty()) {
            return 0;
        }

        int totalProgress = 0;

        for (Goal goal : goalList) {

            totalProgress += goal.getProgressPercentage();
        }

        return (double) totalProgress / goalList.size();
    }

    public int getGoalsNearDeadline() {

        int count = 0;

        for (Goal goal : goalList) {

            if (goal.getTargetDate().isBefore(LocalDate.now().plusDays(3))
                    && goal.getProgressPercentage() < 100) {

                count++;
            }
        }

        return count;
    }

    public void printGoalReport() {

        System.out.println("\n===== GOAL ANALYTICS REPORT =====");

        System.out.println("Total Goals: " + getTotalGoals());

        System.out.println("Completed Goals: " + getCompletedGoals());

        System.out.printf("Average Progress: %.2f%%\n", getAverageProgress());

        System.out.println("Goals Near Deadline: " + getGoalsNearDeadline());

        System.out.println("===============================\n");
    }
}