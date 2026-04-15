package com.example.demo;

import org.springframework.http.ResponseEntity;
<<<<<<< HEAD
import org.springframework.security.core.context.SecurityContextHolder;
=======
>>>>>>> 76ef85031b1cf4be3cb25367f38c3cfec22308a3
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
public class TaskController {

<<<<<<< HEAD
    private final TaskRepository taskRepo;
    private final UserRepository userRepo;

    public TaskController(TaskRepository taskRepo, UserRepository userRepo) {
        this.taskRepo = taskRepo;
        this.userRepo = userRepo;
    }

    /** Returns the authenticated user's UUID (from the JWT subject claim). */
    private String currentUser() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
=======
    private final TaskRepository repo;

    public TaskController(TaskRepository repo) {
        this.repo = repo;
>>>>>>> 76ef85031b1cf4be3cb25367f38c3cfec22308a3
    }

    @GetMapping("/tasks")
    public List<Task> getTasks() {
<<<<<<< HEAD
        return taskRepo.findByUser_Id(currentUser());
=======
        return repo.findAll();
>>>>>>> 76ef85031b1cf4be3cb25367f38c3cfec22308a3
    }

    @PostMapping("/tasks")
    public Task addTask(@RequestBody Task task) {
<<<<<<< HEAD
        // getReferenceById returns a proxy — no extra SELECT, just sets the FK
        task.setUser(userRepo.getReferenceById(currentUser()));
        return taskRepo.save(task);
=======
        return repo.save(task);
>>>>>>> 76ef85031b1cf4be3cb25367f38c3cfec22308a3
    }

    @PutMapping("/tasks/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable String id, @RequestBody Task updates) {
<<<<<<< HEAD
        String uid = currentUser();
        return taskRepo.findById(id)
                .filter(t -> uid.equals(t.getUserId()))   // ownership check
                .map(task -> {
                    if (updates.getTitle()  != null) task.setTitle(updates.getTitle());
                    if (updates.getStatus() != null) task.setStatus(updates.getStatus());
                    return ResponseEntity.ok(taskRepo.save(task));
=======
        return repo.findById(id)
                .map(task -> {
                    if (updates.getTitle() != null)  task.setTitle(updates.getTitle());
                    if (updates.getStatus() != null) task.setStatus(updates.getStatus());
                    return ResponseEntity.ok(repo.save(task));
>>>>>>> 76ef85031b1cf4be3cb25367f38c3cfec22308a3
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable String id) {
<<<<<<< HEAD
        String uid  = currentUser();
        Task   task = taskRepo.findById(id).orElse(null);
        if (task == null || !uid.equals(task.getUserId())) {
            return ResponseEntity.notFound().build();
        }
        taskRepo.deleteById(id);
=======
        if (!repo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repo.deleteById(id);
>>>>>>> 76ef85031b1cf4be3cb25367f38c3cfec22308a3
        return ResponseEntity.noContent().build();
    }
}
