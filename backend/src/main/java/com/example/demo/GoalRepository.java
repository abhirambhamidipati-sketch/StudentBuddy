package com.example.demo;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GoalRepository extends JpaRepository<Goal, String> {

    // Traverses Goal.user.id — generates WHERE g.user_id = :userId
    List<Goal> findByUser_Id(String userId);
}
