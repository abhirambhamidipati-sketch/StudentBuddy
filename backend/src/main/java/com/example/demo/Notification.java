package com.example.demo;

/**
 * A transient reminder notification — never persisted, lives only in
 * ReminderService's in-memory queue until drained by GET /reminders.
 */
public class Notification {

    private String type;     // "UPCOMING" | "MISSED"
    private String message;  // human-readable text for the toast
    private String eventId;  // the timetable event that triggered this

    public Notification() {}

    public Notification(String type, String message, String eventId) {
        this.type    = type;
        this.message = message;
        this.eventId = eventId;
    }

    public String getType()    { return type;    }
    public String getMessage() { return message; }
    public String getEventId() { return eventId; }

    public void setType(String type)       { this.type    = type;    }
    public void setMessage(String message) { this.message = message; }
    public void setEventId(String eventId) { this.eventId = eventId; }
}
