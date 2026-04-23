package com.example.demo;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

/**
 * A kanban-style task owned by a single user.
 *
 * @JsonIgnoreProperties("user") keeps the serialised JSON clean — consumers
 * receive { id, title, status, userId } without the nested User object,
 * while the ManyToOne FK is still present in the database.
 *
 * getUserId() exposes the owner UUID as a plain string so the frontend and
 * ChatService can reference it without deserialising the whole User.
 */
@Entity
@JsonIgnoreProperties("user")
public class Task {

    @Id
    private String id;

    private String title;
    private String status;   // "todo" | "doing" | "done"

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    public Task() {}

    // ── Getters ───────────────────────────────────────────────────────────────
    public String getId()     { return id; }
    public String getTitle()  { return title; }
    public String getStatus() { return status; }
    public User   getUser()   { return user; }

    /** Exposes the owner's UUID as a plain string for backward-compatible JSON. */
    public String getUserId() { return user != null ? user.getId() : null; }

    // ── Setters ───────────────────────────────────────────────────────────────
    public void setId(String id)         { this.id = id; }
    public void setTitle(String title)   { this.title = title; }
    public void setStatus(String status) { this.status = status; }
    public void setUser(User user)       { this.user = user; }
}
