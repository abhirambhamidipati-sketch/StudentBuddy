package com.example.demo;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, String> {

    // Traverses Task.user.id — generates WHERE t.user_id = :userId
    List<Task> findByUser_Id(String userId);
}
