package com.example.demo;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface TimetableRepository extends JpaRepository<Timetable, String> {

    // Traverses Timetable.user.id — generates WHERE t.user_id = :userId
    List<Timetable> findByUser_Id(String userId);

    // All events on a given date — used by ReminderService (all users)
    List<Timetable> findByDate(LocalDate date);

    // Per-user events on a given date — used by /events/today and AnalyticsController
    List<Timetable> findByUser_IdAndDate(String userId, LocalDate date);

    // Per-user events within a date range — used by GET /events?startDate=...&endDate=...
    List<Timetable> findByUser_IdAndDateBetween(String userId, LocalDate start, LocalDate end);
}
