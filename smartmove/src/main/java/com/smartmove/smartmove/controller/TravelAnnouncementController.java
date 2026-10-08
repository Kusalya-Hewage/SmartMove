package com.smartmove.smartmove.controller;

import com.smartmove.smartmove.document.TravelAnnouncement;
import com.smartmove.smartmove.mongoservice.TravelAnnouncementService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mongo/announcements")
@CrossOrigin
public class TravelAnnouncementController {

    private final TravelAnnouncementService service;

    public TravelAnnouncementController(
            TravelAnnouncementService service) {

        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<TravelAnnouncement>>
    getAllAnnouncements() {

        return ResponseEntity.ok(
                service.getAllAnnouncements());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TravelAnnouncement>
    getAnnouncementById(@PathVariable String id) {

        return ResponseEntity.ok(
                service.getAnnouncementById(id));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<TravelAnnouncement>>
    getByStatus(@PathVariable String status) {

        return ResponseEntity.ok(
                service.getByStatus(status));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<TravelAnnouncement>>
    getByType(@PathVariable String type) {

        return ResponseEntity.ok(
                service.getByType(type));
    }

    @GetMapping("/route/{routeId}")
    public ResponseEntity<List<TravelAnnouncement>>
    getByRoute(@PathVariable Long routeId) {

        return ResponseEntity.ok(
                service.getByRouteId(routeId));
    }

    @GetMapping("/priority/{priority}")
    public ResponseEntity<List<TravelAnnouncement>>
    getByPriority(@PathVariable String priority) {

        return ResponseEntity.ok(
                service.getByPriority(priority));
    }

    @PostMapping
    public ResponseEntity<TravelAnnouncement>
    createAnnouncement(
            @RequestBody TravelAnnouncement announcement) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(service.createAnnouncement(announcement));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TravelAnnouncement>
    updateAnnouncement(
            @PathVariable String id,
            @RequestBody TravelAnnouncement announcement) {

        return ResponseEntity.ok(
                service.updateAnnouncement(id, announcement));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String>
    deleteAnnouncement(@PathVariable String id) {

        service.deleteAnnouncement(id);

        return ResponseEntity.ok(
                "Announcement deleted successfully.");
    }

    @GetMapping("/current")
    public ResponseEntity<List<TravelAnnouncement>>
    getCurrentlyActive() {

        return ResponseEntity.ok(
                service.getCurrentlyActive());
    }
}
