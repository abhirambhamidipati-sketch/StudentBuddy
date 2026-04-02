package com.studentbuddy.service;

import com.studentbuddy.model.Timetable;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class TimetableService {

    private List<Timetable> timetableList = new ArrayList<>();
    private int counter = 1;

    private static final String FILE_NAME = "timetable.dat";

    public void addEntry(String subject, String day, String start, String end) {
        Timetable t = new Timetable(counter++, subject, day, start, end);
        timetableList.add(t);
        System.out.println("Timetable entry added successfully!");
    }

    public void viewTimetable() {
        if (timetableList.isEmpty()) {
            System.out.println("No timetable entries.");
            return;
        }

        for (Timetable t : timetableList) {
            System.out.println(t);
        }
    }

    public void deleteEntry(int id) {
        timetableList.removeIf(t -> t.getId() == id);
        System.out.println("Entry deleted if existed.");
    }

    public List<Timetable> getTimetableList() {
        return timetableList;
    }

    // SAVE
    public void saveToFile() {
        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(FILE_NAME))) {
            oos.writeObject(timetableList);
        } catch (IOException e) {
            System.out.println("Error saving timetable.");
        }
    }

    // LOAD
    public void loadFromFile() {
        try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(FILE_NAME))) {
            timetableList = (List<Timetable>) ois.readObject();
            counter = timetableList.size() + 1;
        } catch (Exception e) {
            timetableList = new ArrayList<>();
        }
    }
}