package com.example.demo;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class Task {

    @Id
    private String id;
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