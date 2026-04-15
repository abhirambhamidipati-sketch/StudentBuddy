package com.example.demo;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@CrossOrigin
public class TimetableController {

    private final TimetableRepository timetableRepo;
    private final UserRepository      userRepo;

    public TimetableController(TimetableRepository timetableRepo, UserRepository userRepo) {
        this.timetableRepo = timetableRepo;
        this.userRepo      = userRepo;
    }

    private String currentUser() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping("/events")
    public List<Timetable> getEvents(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        String uid = currentUser();
        if (startDate != null && endDate != null) {
            return timetableRepo.findByUser_IdAndDateBetween(
                    uid, LocalDate.parse(startDate), LocalDate.parse(endDate));
        }
        return timetableRepo.findByUser_Id(uid);
    }

    @GetMapping("/events/today")
    public List<Timetable> getTodayEvents() {
        return timetableRepo.findByUser_IdAndDate(currentUser(), LocalDate.now());
    }

    @PostMapping("/events")
    public Timetable addEvent(@RequestBody Timetable event) {
        event.setUser(userRepo.getReferenceById(currentUser()));
        return timetableRepo.save(event);
    }

    @PutMapping("/events/{id}")
    public ResponseEntity<Timetable> updateEvent(@PathVariable String id,
                                                  @RequestBody Timetable updates) {
        String uid = currentUser();
        return timetableRepo.findById(id)
                .filter(e -> uid.equals(e.getUserId()))   // ownership check
                .map(event -> {
                    if (updates.getTitle()      != null) event.setTitle(updates.getTitle());
                    if (updates.getDate()       != null) event.setDate(updates.getDate());
                    if (updates.getStartTime()  != null) event.setStartTime(updates.getStartTime());
                    if (updates.getEndTime()    != null) event.setEndTime(updates.getEndTime());
                    if (updates.getCompleted()  != null) event.setCompleted(updates.getCompleted());
                    if (updates.getRoom()       != null) event.setRoom(updates.getRoom());
                    if (updates.getInstructor() != null) event.setInstructor(updates.getInstructor());
                    return ResponseEntity.ok(timetableRepo.save(event));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/events/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable String id) {
        String    uid   = currentUser();
        Timetable event = timetableRepo.findById(id).orElse(null);
        if (event == null || !uid.equals(event.getUserId())) {
            return ResponseEntity.notFound().build();
        }
        timetableRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
