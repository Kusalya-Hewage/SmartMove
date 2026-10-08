package com.smartmove.smartmove.controller;

import com.smartmove.smartmove.entity.Driver;
import com.smartmove.smartmove.service.DriverService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/drivers")
@CrossOrigin(origins = "*")
public class DriverController {

    private final DriverService driverService;

    public DriverController(DriverService driverService) {
        this.driverService = driverService;
    }

    // GET all drivers
    @GetMapping
    public ResponseEntity<List<Driver>> getAllDrivers() {

        return ResponseEntity.ok(
                driverService.getAllDrivers()
        );
    }

    // GET driver by ID
    @GetMapping("/{id}")
    public ResponseEntity<Driver> getDriverById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                driverService.getDriverById(id)
        );
    }

    // POST - create driver
    @PostMapping
    public ResponseEntity<Driver> createDriver(
            @RequestBody Driver driver) {

        Driver savedDriver =
                driverService.createDriver(driver);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedDriver);
    }

    // PUT - update driver
    @PutMapping("/{id}")
    public ResponseEntity<Driver> updateDriver(
            @PathVariable Long id,
            @RequestBody Driver driver) {

        Driver updatedDriver =
                driverService.updateDriver(id, driver);

        return ResponseEntity.ok(updatedDriver);
    }

    // DELETE - delete driver
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteDriver(
            @PathVariable Long id) {

        driverService.deleteDriver(id);

        return ResponseEntity.ok(
                "Driver deleted successfully"
        );
    }
}