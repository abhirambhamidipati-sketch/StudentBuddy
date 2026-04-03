package com.studentbuddy.model;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalTime;

public class Timetable implements Serializable {

    private int id;
    private String event;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean completed;

    public Timetable(int id, String event, LocalDate date, LocalTime startTime, LocalTime endTime) {
        this.id = id;
        this.event = event;
        this.date = date;
        this.startTime = startTime;
        this.endTime = endTime;
        this.completed = false;
    }

    public int getId() { return id; }
    public String getEvent() { return event; }
    public LocalDate getDate() { return date; }
    public LocalTime getStartTime() { return startTime; }
    public LocalTime getEndTime() { return endTime; }

    public boolean isCompleted() { return completed; }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }
}