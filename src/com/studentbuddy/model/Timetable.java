package com.studentbuddy.model;

import java.io.Serializable;

public class Timetable implements Serializable {

    private int id;
    private String subject;
    private String day;
    private String startTime;
    private String endTime;

    public Timetable(int id, String subject, String day, String startTime, String endTime) {
        this.id = id;
        this.subject = subject;
        this.day = day;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public int getId() {
        return id;
    }

    public String getSubject() {
        return subject;
    }

    public String getDay() {
        return day;
    }

    public String getStartTime() {
        return startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    @Override
    public String toString() {
        return "\nID: " + id +
                "\nSubject: " + subject +
                "\nDay: " + day +
                "\nTime: " + startTime + " - " + endTime +
                "\n---------------------------";
    }
}