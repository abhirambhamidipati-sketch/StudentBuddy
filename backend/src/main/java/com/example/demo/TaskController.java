package com.example.demo;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
public class TaskController {

    private final TaskRepository repo;

    public TaskController(TaskRepository repo) {
        this.repo = repo;
    }

    @GetMapping("/tasks")
    public List<Task> getTasks() {
        return repo.findAll();
    }

    @PostMapping("/tasks")
    public Task addTask(@RequestBody Task task) {
        return repo.save(task);
    }

    @PutMapping("/tasks/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable String id, @RequestBody Task updates) {
        return repo.findById(id)
                .map(task -> {
                    if (updates.getTitle() != null)  task.setTitle(updates.getTitle());
                    if (updates.getStatus() != null) task.setStatus(updates.getStatus());
                    return ResponseEntity.ok(repo.save(task));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable String id) {
        if (!repo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
