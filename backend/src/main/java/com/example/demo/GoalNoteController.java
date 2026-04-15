package com.example.demo;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin
public class GoalNoteController {

    private final GoalNoteRepository noteRepo;
    private final GoalRepository     goalRepo;

    public GoalNoteController(GoalNoteRepository noteRepo, GoalRepository goalRepo) {
        this.noteRepo = noteRepo;
        this.goalRepo = goalRepo;
    }

    private String currentUser() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    /**
     * GET /goals/{goalId}/notes
     *
     * Returns all notes for the goal, sorted newest-first.
     * 404 if the goal doesn't exist or belongs to a different user.
     */
    @GetMapping("/goals/{goalId}/notes")
    public ResponseEntity<List<GoalNote>> getNotes(@PathVariable String goalId) {
        String uid = currentUser();
        return goalRepo.findById(goalId)
                .filter(g -> uid.equals(g.getUserId()))
                .map(goal -> ResponseEntity.ok(
                        noteRepo.findByGoal_IdOrderByCreatedAtDesc(goalId)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /goals/{goalId}/notes
     *
     * Body: { "content": "..." }
     * Creates and returns the new note (id, goalId, content, createdAt auto-set).
     * 400 if content is blank.  404 if goal not found / not owned.
     */
    @PostMapping("/goals/{goalId}/notes")
    public ResponseEntity<?> addNote(
            @PathVariable String goalId,
            @RequestBody Map<String, String> body) {

        String content = body.get("content");
        if (content == null || content.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Note content must not be blank."));
        }

        String uid = currentUser();
        return goalRepo.findById(goalId)
                .filter(g -> uid.equals(g.getUserId()))
                .map(goal -> {
                    GoalNote note = new GoalNote();
                    note.setGoal(goal);
                    note.setContent(content.trim());
                    return ResponseEntity.ok((Object) noteRepo.save(note));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
