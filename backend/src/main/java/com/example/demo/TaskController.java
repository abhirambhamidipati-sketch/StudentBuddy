package com.example.demo;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
public class TaskController {

    private final TaskRepository taskRepo;
    private final UserRepository userRepo;

    public TaskController(TaskRepository taskRepo, UserRepository userRepo) {
        this.taskRepo = taskRepo;
        this.userRepo = userRepo;
    }

    /** Returns the authenticated user's UUID (from the JWT subject claim). */
    private String currentUser() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping("/tasks")
    public List<Task> getTasks() {
        return taskRepo.findByUser_Id(currentUser());
    }

    @PostMapping("/tasks")
    public Task addTask(@RequestBody Task task) {
        // getReferenceById returns a proxy — no extra SELECT, just sets the FK
        task.setUser(userRepo.getReferenceById(currentUser()));
        return taskRepo.save(task);
    }

    @PutMapping("/tasks/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable String id, @RequestBody Task updates) {
        String uid = currentUser();
        return taskRepo.findById(id)
                .filter(t -> uid.equals(t.getUserId()))   // ownership check
                .map(task -> {
                    if (updates.getTitle()  != null) task.setTitle(updates.getTitle());
                    if (updates.getStatus() != null) task.setStatus(updates.getStatus());
                    return ResponseEntity.ok(taskRepo.save(task));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable String id) {
        String uid  = currentUser();
        Task   task = taskRepo.findById(id).orElse(null);
        if (task == null || !uid.equals(task.getUserId())) {
            return ResponseEntity.notFound().build();
        }
        taskRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
