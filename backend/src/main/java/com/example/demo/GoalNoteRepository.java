package com.example.demo;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GoalNoteRepository extends JpaRepository<GoalNote, String> {

    /** All notes for a given goal, newest first. */
    List<GoalNote> findByGoal_IdOrderByCreatedAtDesc(String goalId);
}
