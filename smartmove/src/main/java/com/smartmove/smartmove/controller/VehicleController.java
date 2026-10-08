package com.smartmove.smartmove.controller;

import com.smartmove.smartmove.entity.Vehicle;
import com.smartmove.smartmove.service.VehicleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(origins = "*")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    // GET all vehicles
    @GetMapping
    public ResponseEntity<List<Vehicle>> getAllVehicles() {

        return ResponseEntity.ok(
                vehicleService.getAllVehicles()
        );
    }

    // GET vehicle by ID
    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getVehicleById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                vehicleService.getVehicleById(id)
        );
    }

    // POST - create vehicle
    @PostMapping
    public ResponseEntity<Vehicle> createVehicle(
            @RequestBody Vehicle vehicle) {

        Vehicle savedVehicle =
                vehicleService.createVehicle(vehicle);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedVehicle);
    }

    // PUT - update vehicle
    @PutMapping("/{id}")
    public ResponseEntity<Vehicle> updateVehicle(
            @PathVariable Long id,
            @RequestBody Vehicle vehicle) {

        Vehicle updatedVehicle =
                vehicleService.updateVehicle(id, vehicle);

        return ResponseEntity.ok(updatedVehicle);
    }

    // DELETE - delete vehicle
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteVehicle(
            @PathVariable Long id) {

        vehicleService.deleteVehicle(id);

        return ResponseEntity.ok(
                "Vehicle deleted successfully"
        );
    }
}
