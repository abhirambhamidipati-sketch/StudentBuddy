package com.example.demo;

import org.springframework.data.jpa.repository.JpaRepository;
<<<<<<< HEAD
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, String> {

    // Traverses Task.user.id — generates WHERE t.user_id = :userId
    List<Task> findByUser_Id(String userId);
}
=======

public interface TaskRepository extends JpaRepository<Task, String> {
}
>>>>>>> 76ef85031b1cf4be3cb25367f38c3cfec22308a3
