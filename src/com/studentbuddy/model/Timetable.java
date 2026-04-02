package com.studentbuddy.model;
import java.io.Serializable;

public class Timetable implements Serializable {

    private int timetableId;
    private String subjectName;
    private String day;
    private String startTime;
    private String endTime;

    public Timetable(int timetableId, String subjectName, String day, String startTime, String endTime) {
        this.timetableId = timetableId;
        this.subjectName = subjectName;
        this.day = day;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public int getTimetableId() {
        return timetableId;
    }

    public String getSubjectName() {
        return subjectName;
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

        return "\nTimetable ID: " + timetableId +
                "\nSubject: " + subjectName +
                "\nDay: " + day +
                "\nTime: " + startTime + " - " + endTime +
                "\n---------------------------";
    }
}