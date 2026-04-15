package com.example.demo;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin
public class GoalController {

    private final GoalRepository goalRepo;
    private final UserRepository userRepo;

    public GoalController(GoalRepository goalRepo, UserRepository userRepo) {
        this.goalRepo = goalRepo;
        this.userRepo = userRepo;
    }

    private String currentUser() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping("/goals")
    public List<Goal> getGoals() {
        return goalRepo.findByUser_Id(currentUser());
    }

    @PostMapping("/goals")
    public Goal addGoal(@RequestBody Goal goal) {
        goal.setUser(userRepo.getReferenceById(currentUser()));
        return goalRepo.save(goal);
    }

    @PutMapping("/goals/{id}")
    public ResponseEntity<Goal> updateGoal(@PathVariable String id, @RequestBody Goal updates) {
        String uid = currentUser();
        return goalRepo.findById(id)
                .filter(g -> uid.equals(g.getUserId()))   // ownership check
                .map(goal -> {
                    if (updates.getName()       != null) goal.setName(updates.getName());
                    if (updates.getTargetDate() != null) goal.setTargetDate(updates.getTargetDate());
                    if (updates.getProgress()   != null) {
                        int p = updates.getProgress();
                        if (p >= 0 && p <= 100) goal.setProgress(p);
                    }
                    return ResponseEntity.ok(goalRepo.save(goal));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/goals/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable String id) {
        String uid  = currentUser();
        Goal   goal = goalRepo.findById(id).orElse(null);
        if (goal == null || !uid.equals(goal.getUserId())) {
            return ResponseEntity.notFound().build();
        }
        goalRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
