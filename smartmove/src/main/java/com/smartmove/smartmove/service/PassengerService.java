package com.smartmove.smartmove.service;

import com.smartmove.smartmove.entity.Passenger;
import com.smartmove.smartmove.repository.PassengerRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class PassengerService {

    private final PassengerRepository passengerRepository;

    public PassengerService(PassengerRepository passengerRepository) {
        this.passengerRepository = passengerRepository;
    }



    public List<Passenger> getAllPassengers() {

        return passengerRepository.findAll();
    }



    public Passenger getPassengerById(Long id) {

        return passengerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Passenger not found with ID: " + id
                        )
                );
    }



    public Passenger createPassenger(Passenger passenger) {

        // Check duplicate email
        if (passengerRepository
                .findByEmailIgnoreCase(passenger.getEmail())
                .isPresent()) {

            throw new RuntimeException(
                    "Passenger with this email already exists"
            );
        }

        // Automatically set registration date
        passenger.setRegistrationDate(
                LocalDate.now()
        );

        // Set default status
        if (passenger.getStatus() == null ||
                passenger.getStatus().isBlank()) {

            passenger.setStatus("ACTIVE");
        }

        return passengerRepository.save(passenger);
    }



    public Passenger updatePassenger(
            Long id,
            Passenger passengerDetails) {

        Passenger passenger =
                passengerRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Passenger not found with ID: "
                                                + id
                                )
                        );

        passenger.setFullName(
                passengerDetails.getFullName()
        );

        passenger.setEmail(
                passengerDetails.getEmail()
        );

        passenger.setPhone(
                passengerDetails.getPhone()
        );

        passenger.setPassword(
                passengerDetails.getPassword()
        );

        passenger.setAddress(
                passengerDetails.getAddress()
        );


        if (passengerDetails.getRegistrationDate() != null) {

            passenger.setRegistrationDate(
                    passengerDetails.getRegistrationDate()
            );
        }

        if (passengerDetails.getStatus() != null &&
                !passengerDetails.getStatus().isBlank()) {

            passenger.setStatus(
                    passengerDetails.getStatus()
            );
        }

        return passengerRepository.save(passenger);
    }



    public void deletePassenger(Long id) {

        if (!passengerRepository.existsById(id)) {

            throw new RuntimeException(
                    "Passenger not found with ID: " + id
            );
        }

        passengerRepository.deleteById(id);
    }
}