package com.studentbuddy.service;

import com.studentbuddy.model.Timetable;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class TimetableService implements DataService {

    private List<Timetable> timetableList = new ArrayList<>();
    private int timetableCounter = 1;

    public void addEntry(String subjectName, String day, String startTime, String endTime) {
        Timetable timetable = new Timetable(timetableCounter++, subjectName, day, startTime, endTime);
        timetableList.add(timetable);
        System.out.println("Timetable entry added successfully!");
    }

    public void viewTimetable() {

        if (timetableList.isEmpty()) {
            System.out.println("No timetable entries available.");
            return;
        }

        for (Timetable timetable : timetableList) {
            System.out.println(timetable);
        }
    }

    public void deleteEntry(int timetableId) {

        Timetable entryToRemove = null;

        for (Timetable timetable : timetableList) {
            if (timetable.getTimetableId() == timetableId) {
                entryToRemove = timetable;
                break;
            }
        }

        if (entryToRemove != null) {
            timetableList.remove(entryToRemove);
            System.out.println("Timetable entry deleted successfully!");
        } else {
            System.out.println("Timetable entry not found.");
        }
    }

    public List<Timetable> getTimetableList() {
        return timetableList;
    }

    public void saveToFile() {

        try (ObjectOutputStream out = new ObjectOutputStream(
                new FileOutputStream("timetable.dat"))) {

            out.writeObject(timetableList);

        } catch (IOException e) {
            System.out.println("Error saving timetable.");
        }
    }

    @SuppressWarnings("unchecked")
    public void loadFromFile() {

        try (ObjectInputStream in = new ObjectInputStream(
                new FileInputStream("timetable.dat"))) {

            timetableList = (List<Timetable>) in.readObject();

            if (!timetableList.isEmpty()) {
                timetableCounter =
                        timetableList.get(timetableList.size() - 1).getTimetableId() + 1;
            }

        } catch (IOException | ClassNotFoundException e) {
            System.out.println("No existing timetable data.");
        }
    }
}