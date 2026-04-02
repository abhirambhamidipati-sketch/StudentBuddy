package com.studentbuddy.model;

import java.time.LocalDate;
import java.io.Serializable;

public class Goal implements Serializable {

    private int goalId;
    private String goalName;
    private LocalDate targetDate;
    private int progress;

    public Goal(int goalId, String goalName, LocalDate targetDate) {
        this.goalId = goalId;
        this.goalName = goalName;
        this.targetDate = targetDate;
        this.progress = 0;
    }

    public int getGoalId() {
        return goalId;
    }

    public String getGoalName() {
        return goalName;
    }

    public LocalDate getTargetDate() {
        return targetDate;
    }

    // Standard getter
    public int getProgress() {
        return progress;
    }

    // Compatibility method (fixes your error)
    public int getProgressPercentage() {
        return progress;
    }

    public void updateProgress(int progress) {
        if (progress >= 0 && progress <= 100) {
            this.progress = progress;
        }
    }

    @Override
    public String toString() {
        return "\nGoal ID: " + goalId +
                "\nGoal Name: " + goalName +
                "\nTarget Date: " + targetDate +
                "\nProgress: " + progress + "%" +
                "\n---------------------------";
    }
}