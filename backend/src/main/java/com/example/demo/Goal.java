package com.example.demo;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDate;

/**
 * A personal goal owned by a single user.
 *
 * See Task.java for the @JsonIgnoreProperties / @ManyToOne design rationale.
 */
@Entity
@JsonIgnoreProperties("user")
public class Goal {

    @Id
    private String id;

    private String    name;
    private LocalDate targetDate;
    private Integer   progress;   // boxed — nullable so partial PUTs don't reset it

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    public Goal() {}

    // ── Getters ───────────────────────────────────────────────────────────────
    public String    getId()         { return id; }
    public String    getName()       { return name; }
    public LocalDate getTargetDate() { return targetDate; }
    public Integer   getProgress()   { return progress; }
    public User      getUser()       { return user; }

    /** Exposes the owner's UUID as a plain string for backward-compatible JSON. */
    public String getUserId() { return user != null ? user.getId() : null; }

    // ── Setters ───────────────────────────────────────────────────────────────
    public void setId(String id)               { this.id = id; }
    public void setName(String name)           { this.name = name; }
    public void setTargetDate(LocalDate date)  { this.targetDate = date; }
    public void setProgress(Integer progress)  { this.progress = progress; }
    public void setUser(User user)             { this.user = user; }
}
