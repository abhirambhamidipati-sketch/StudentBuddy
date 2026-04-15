package com.example.demo;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * A timestamped note attached to a single Goal.
 *
 * The @JsonIgnoreProperties("goal") annotation keeps the serialised JSON clean:
 * consumers receive { id, goalId, content, createdAt } without the nested Goal
 * object, while the ManyToOne FK is still present in the database.
 */
@Entity
@JsonIgnoreProperties("goal")
public class GoalNote {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "goal_id", nullable = false)
    private Goal goal;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    private LocalDateTime createdAt;

    /** Auto-assign UUID and timestamp before first persist. */
    @PrePersist
    void prePersist() {
        if (id == null || id.isBlank()) {
            id = UUID.randomUUID().toString();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public GoalNote() {}

    // ── Getters ───────────────────────────────────────────────────────────────
    public String        getId()        { return id; }
    public Goal          getGoal()      { return goal; }
    public String        getContent()   { return content; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    /** Exposes the parent goal's UUID as a plain string — used by the frontend. */
    public String getGoalId() { return goal != null ? goal.getId() : null; }

    // ── Setters ───────────────────────────────────────────────────────────────
    public void setId(String id)               { this.id = id; }
    public void setGoal(Goal goal)             { this.goal = goal; }
    public void setContent(String content)     { this.content = content; }
    public void setCreatedAt(LocalDateTime t)  { this.createdAt = t; }
}
