package com.studentbuddy.service;

import com.studentbuddy.model.Timetable;

import java.io.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public class TimetableService {

    private List<Timetable> timetableList = new ArrayList<>();
    private int counter = 1;

    private static final String FILE_NAME = "timetable.dat";

    public void addEntry(String event, LocalDate date, LocalTime start, LocalTime end) {
        timetableList.add(new Timetable(counter++, event, date, start, end));
    }

    public void toggleComplete(int id) {
        for (Timetable t : timetableList) {
            if (t.getId() == id) {
                t.setCompleted(!t.isCompleted());
            }
        }
    }

    public void deleteEntry(int id) {
        timetableList.removeIf(t -> t.getId() == id);
    }

    public List<Timetable> getTimetableList() {
        return timetableList;
    }

    public void saveToFile() {
        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(FILE_NAME))) {
            oos.writeObject(timetableList);
        } catch (IOException e) {
            System.out.println("Error saving timetable.");
        }
    }

    public void loadFromFile() {
        try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(FILE_NAME))) {
            timetableList = (List<Timetable>) ois.readObject();
            counter = timetableList.size() + 1;
        } catch (Exception e) {
            timetableList = new ArrayList<>();
        }
    }
}