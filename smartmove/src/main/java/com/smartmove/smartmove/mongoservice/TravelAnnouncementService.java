package com.smartmove.smartmove.mongoservice;

import com.smartmove.smartmove.document.TravelAnnouncement;
import com.smartmove.smartmove.entity.Route;
import com.smartmove.smartmove.entity.Trip;
import com.smartmove.smartmove.mongorepository.TravelAnnouncementRepository;
import com.smartmove.smartmove.repository.RouteRepository;
import com.smartmove.smartmove.repository.TripRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TravelAnnouncementService {

    private final TravelAnnouncementRepository repository;
    private final RouteRepository routeRepository;
    private final TripRepository tripRepository;

    public TravelAnnouncementService(
            TravelAnnouncementRepository repository,
            RouteRepository routeRepository,
            TripRepository tripRepository) {

        this.repository = repository;
        this.routeRepository = routeRepository;
        this.tripRepository = tripRepository;
    }

    public List<TravelAnnouncement> getAllAnnouncements() {
        return repository.findAll();
    }

    public TravelAnnouncement getAnnouncementById(String id) {

        return repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Announcement not found with ID: " + id));
    }

    public List<TravelAnnouncement> getByStatus(String status) {
        return repository.findByStatus(status);
    }

    public List<TravelAnnouncement> getByType(
            String announcementType) {

        return repository.findByAnnouncementType(announcementType);
    }

    public List<TravelAnnouncement> getByRouteId(Long routeId) {
        return repository.findByRouteId(routeId);
    }

    public List<TravelAnnouncement> getByPriority(String priority) {
        return repository.findByPriority(priority);
    }

    public List<TravelAnnouncement> getCurrentlyActive() {

        return repository.findCurrentlyActive(
                LocalDateTime.now());
    }

    public TravelAnnouncement createAnnouncement(
            TravelAnnouncement announcement) {


        if (announcement.getRouteId() != null) {

            Route route = routeRepository
                    .findById(announcement.getRouteId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Route not found with ID: "
                                            + announcement.getRouteId()));
        }


        if (announcement.getTripId() != null) {

            Trip trip = tripRepository
                    .findById(announcement.getTripId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Trip not found with ID: "
                                            + announcement.getTripId()));


            if (announcement.getRouteId() != null
                    && trip.getRoute() != null
                    && !trip.getRoute()
                    .getRouteId()
                    .equals(announcement.getRouteId())) {

                throw new RuntimeException(
                        "The selected trip does not belong "
                                + "to the selected route.");
            }
        }

        if (announcement.getTitle() == null
                || announcement.getTitle().isBlank()) {

            throw new RuntimeException(
                    "Announcement title is required.");
        }

        if (announcement.getMessage() == null
                || announcement.getMessage().isBlank()) {

            throw new RuntimeException(
                    "Announcement message is required.");
        }

        if (announcement.getAnnouncementType() == null
                || announcement.getAnnouncementType().isBlank()) {

            announcement.setAnnouncementType("GENERAL");
        }

        if (announcement.getPublishDate() == null) {
            announcement.setPublishDate(LocalDateTime.now());
        }

        if (announcement.getStatus() == null
                || announcement.getStatus().isBlank()) {

            announcement.setStatus("ACTIVE");
        }

        if (announcement.getPriority() == null
                || announcement.getPriority().isBlank()) {

            announcement.setPriority("NORMAL");
        }

        return repository.save(announcement);
    }

    public TravelAnnouncement updateAnnouncement(
            String id,
            TravelAnnouncement updatedAnnouncement) {

        TravelAnnouncement existing =
                getAnnouncementById(id);


        if (updatedAnnouncement.getRouteId() != null) {

            routeRepository
                    .findById(updatedAnnouncement.getRouteId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Route not found with ID: "
                                            + updatedAnnouncement
                                            .getRouteId()));
        }

        if (updatedAnnouncement.getTripId() != null) {

            Trip trip = tripRepository
                    .findById(updatedAnnouncement.getTripId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Trip not found with ID: "
                                            + updatedAnnouncement
                                            .getTripId()));

            if (updatedAnnouncement.getRouteId() != null
                    && trip.getRoute() != null
                    && !trip.getRoute()
                    .getRouteId()
                    .equals(updatedAnnouncement.getRouteId())) {

                throw new RuntimeException(
                        "The selected trip does not belong "
                                + "to the selected route.");
            }
        }

        existing.setTitle(updatedAnnouncement.getTitle());
        existing.setMessage(updatedAnnouncement.getMessage());
        existing.setAnnouncementType(
                updatedAnnouncement.getAnnouncementType());
        existing.setRouteId(updatedAnnouncement.getRouteId());
        existing.setTripId(updatedAnnouncement.getTripId());
        existing.setExpiryDate(
                updatedAnnouncement.getExpiryDate());
        existing.setPriority(
                updatedAnnouncement.getPriority());
        existing.setStatus(
                updatedAnnouncement.getStatus());

        return repository.save(existing);
    }

    public void deleteAnnouncement(String id) {

        if (!repository.existsById(id)) {

            throw new RuntimeException(
                    "Announcement not found with ID: " + id);
        }

        repository.deleteById(id);
    }
}