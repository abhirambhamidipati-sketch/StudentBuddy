package com.example.demo;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@CrossOrigin
public class TaskController {

    private List<Map<String, String>> tasks = new ArrayList<>();

    public TaskController() {
        tasks.add(Map.of("id", "1", "title", "Sample Task", "status", "todo"));
    }

    @GetMapping("/tasks")
    public List<Map<String, String>> getTasks() {
        return tasks;
    }

    @PostMapping("/tasks")
    public void addTask(@RequestBody Map<String, String> task) {
        tasks.add(task);
    }
}