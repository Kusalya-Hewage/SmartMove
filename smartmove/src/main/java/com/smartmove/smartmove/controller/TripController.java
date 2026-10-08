package com.smartmove.smartmove.controller;

import com.smartmove.smartmove.entity.Trip;
import com.smartmove.smartmove.service.TripService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/trips")
@CrossOrigin(origins = "*")
public class TripController {

    private final TripService tripService;

    public TripController(TripService tripService) {
        this.tripService = tripService;
    }



    @GetMapping
    public ResponseEntity<List<Trip>> getAllTrips() {

        return ResponseEntity.ok(
                tripService.getAllTrips()
        );
    }



    @GetMapping("/{id}")
    public ResponseEntity<Trip> getTripById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                tripService.getTripById(id)
        );
    }


    @PostMapping
    public ResponseEntity<Trip> createTrip(
            @RequestParam Long routeId,
            @RequestParam Long vehicleId,
            @RequestParam Long driverId,
            @RequestBody Trip trip) {

        Trip savedTrip = tripService.createTrip(
                routeId,
                vehicleId,
                driverId,
                trip
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedTrip);
    }


    @PutMapping("/{id}")
    public ResponseEntity<Trip> updateTrip(
            @PathVariable Long id,
            @RequestParam Long routeId,
            @RequestParam Long vehicleId,
            @RequestParam Long driverId,
            @RequestBody Trip trip) {

        Trip updatedTrip = tripService.updateTrip(
                id,
                routeId,
                vehicleId,
                driverId,
                trip
        );

        return ResponseEntity.ok(updatedTrip);
    }



    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTrip(
            @PathVariable Long id) {

        tripService.deleteTrip(id);

        return ResponseEntity.ok(
                "Trip deleted successfully"
        );
    }



    @GetMapping("/date/{date}")
    public ResponseEntity<List<Trip>> getTripsByDate(
            @PathVariable LocalDate date) {

        return ResponseEntity.ok(
                tripService.getTripsByDate(date)
        );
    }



    @GetMapping("/status/{status}")
    public ResponseEntity<List<Trip>> getTripsByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(
                tripService.getTripsByStatus(status)
        );
    }



    @GetMapping("/route/{routeId}")
    public ResponseEntity<List<Trip>> getTripsByRoute(
            @PathVariable Long routeId) {

        return ResponseEntity.ok(
                tripService.getTripsByRoute(routeId)
        );
    }



    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<Trip>> getTripsByVehicle(
            @PathVariable Long vehicleId) {

        return ResponseEntity.ok(
                tripService.getTripsByVehicle(vehicleId)
        );
    }



    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<Trip>> getTripsByDriver(
            @PathVariable Long driverId) {

        return ResponseEntity.ok(
                tripService.getTripsByDriver(driverId)
        );
    }
}
