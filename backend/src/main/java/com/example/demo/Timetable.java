package com.example.demo;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDate;

/**
 * A scheduled event owned by a single user.
 *
 * See Task.java for the @JsonIgnoreProperties / @ManyToOne design rationale.
 */
@Entity
@JsonIgnoreProperties("user")
public class Timetable {

    @Id
    private String id;

    private String    title;
    private LocalDate date;
    private String    startTime;   // "HH:MM" — keeps serialisation simple
    private String    endTime;     // "HH:MM"
    private Boolean   completed;   // boxed — nullable so partial PUTs don't reset it
    private String    room;        // nullable — venue / room number
    private String    instructor;  // nullable — professor / teacher name

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    public Timetable() {}

    // ── Getters ───────────────────────────────────────────────────────────────
    public String    getId()          { return id; }
    public String    getTitle()       { return title; }
    public LocalDate getDate()        { return date; }
    public String    getStartTime()   { return startTime; }
    public String    getEndTime()     { return endTime; }
    public Boolean   getCompleted()   { return completed; }
    public String    getRoom()        { return room; }
    public String    getInstructor()  { return instructor; }
    public User      getUser()        { return user; }

    /** Exposes the owner's UUID as a plain string for backward-compatible JSON. */
    public String getUserId() { return user != null ? user.getId() : null; }

    // ── Setters ───────────────────────────────────────────────────────────────
    public void setId(String id)                  { this.id = id; }
    public void setTitle(String title)            { this.title = title; }
    public void setDate(LocalDate date)           { this.date = date; }
    public void setStartTime(String t)            { this.startTime = t; }
    public void setEndTime(String t)              { this.endTime = t; }
    public void setCompleted(Boolean b)           { this.completed = b; }
    public void setRoom(String room)              { this.room = room; }
    public void setInstructor(String instructor)  { this.instructor = instructor; }
    public void setUser(User user)                { this.user = user; }
}
