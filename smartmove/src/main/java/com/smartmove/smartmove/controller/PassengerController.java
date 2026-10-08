package com.smartmove.smartmove.controller;

import com.smartmove.smartmove.entity.Passenger;
import com.smartmove.smartmove.service.PassengerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/passengers")
@CrossOrigin(origins = "*")
public class PassengerController {

    private final PassengerService passengerService;

    public PassengerController(
            PassengerService passengerService) {

        this.passengerService = passengerService;
    }



    @GetMapping
    public ResponseEntity<List<Passenger>> getAllPassengers() {

        return ResponseEntity.ok(
                passengerService.getAllPassengers()
        );
    }



    @GetMapping("/{id}")
    public ResponseEntity<Passenger> getPassengerById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                passengerService.getPassengerById(id)
        );
    }



    @PostMapping
    public ResponseEntity<Passenger> createPassenger(
            @RequestBody Passenger passenger) {

        Passenger savedPassenger =
                passengerService.createPassenger(passenger);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedPassenger);
    }



    @PutMapping("/{id}")
    public ResponseEntity<Passenger> updatePassenger(
            @PathVariable Long id,
            @RequestBody Passenger passenger) {

        Passenger updatedPassenger =
                passengerService.updatePassenger(
                        id,
                        passenger
                );

        return ResponseEntity.ok(updatedPassenger);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePassenger(
            @PathVariable Long id) {

        passengerService.deletePassenger(id);

        return ResponseEntity.ok(
                "Passenger deleted successfully"
        );
    }
}
