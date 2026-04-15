package com.example.demo;

<<<<<<< HEAD
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

/**
 * A to-do task owned by a single user.
 *
 * The "user" property is excluded from JSON output via @JsonIgnoreProperties so
 * that the full User object is never serialised into API responses.
 * The derived method getUserId() exposes just the UUID string — preserving
 * the existing API contract that clients already depend on.
 *
 * H2 / ddl-auto=update note:
 *   The underlying column is still named "user_id".  Hibernate will add a FK
 *   constraint on it when the app starts.  A clean database (no legacy rows)
 *   is recommended before first run with this schema.
 */
@Entity
@JsonIgnoreProperties("user")
=======
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
>>>>>>> 76ef85031b1cf4be3cb25367f38c3cfec22308a3
public class Task {

    @Id
    private String id;
<<<<<<< HEAD

    private String title;
    private String status;

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
=======
    private String title;
    private String status;

    public Task() {}

    public Task(String id, String title, String status) {
        this.id = id;
        this.title = title;
        this.status = status;
    }

    public String getId() { return id; }
    public String getTitle() { return title; }
    public String getStatus() { return status; }

    public void setId(String id) { this.id = id; }
    public void setTitle(String title) { this.title = title; }
    public void setStatus(String status) { this.status = status; }
}
>>>>>>> 76ef85031b1cf4be3cb25367f38c3cfec22308a3
