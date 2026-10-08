package com.smartmove.smartmove.service;

import com.smartmove.smartmove.entity.Passenger;
import com.smartmove.smartmove.entity.Ticket;
import com.smartmove.smartmove.entity.Trip;
import com.smartmove.smartmove.repository.PassengerRepository;
import com.smartmove.smartmove.repository.TicketRepository;
import com.smartmove.smartmove.repository.TripRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;



@Service
public class TicketService {


    private final TicketRepository ticketRepository;

    private final TripRepository tripRepository;

    private final PassengerRepository passengerRepository;


    public TicketService(
            TicketRepository ticketRepository,
            TripRepository tripRepository,
            PassengerRepository passengerRepository
    ) {

        this.ticketRepository =
                ticketRepository;

        this.tripRepository =
                tripRepository;

        this.passengerRepository =
                passengerRepository;

    }




    public List<Ticket> getAllTickets() {

        return ticketRepository.findAll();

    }



    public Ticket getTicketById(
            Long id
    ) {

        if (id == null) {

            throw new RuntimeException(
                    "Ticket ID is required"
            );

        }


        return ticketRepository
                .findById(id)
                .orElseThrow(
                        () ->
                                new RuntimeException(
                                        "Ticket not found with ID: "
                                                + id
                                )
                );

    }



    @Transactional
    public Ticket createTicket(
            Long tripId,
            Long passengerId,
            Ticket ticketDetails
    ) {



        if (tripId == null) {

            throw new RuntimeException(
                    "Trip ID is required"
            );

        }


        if (passengerId == null) {

            throw new RuntimeException(
                    "Passenger ID is required"
            );

        }


        if (ticketDetails == null) {

            throw new RuntimeException(
                    "Ticket information is required"
            );

        }



        String seatNumber =
                ticketDetails.getSeatNumber();


        if (
                seatNumber == null ||
                        seatNumber.trim().isEmpty()
        ) {

            throw new RuntimeException(
                    "Seat number is required"
            );

        }


        seatNumber =
                seatNumber
                        .trim()
                        .toUpperCase();


        ticketDetails.setSeatNumber(
                seatNumber
        );




        BigDecimal ticketPrice =
                ticketDetails.getTicketPrice();


        if (ticketPrice == null) {

            throw new RuntimeException(
                    "Ticket price is required"
            );

        }


        if (
                ticketPrice.compareTo(
                        BigDecimal.ZERO
                ) <= 0
        ) {

            throw new RuntimeException(
                    "Ticket price must be greater than zero"
            );

        }


        Trip trip =
                tripRepository.findById(
                        tripId
                ).orElseThrow(
                        () ->
                                new RuntimeException(
                                        "Trip not found with ID: "
                                                + tripId
                                )
                );




        Passenger passenger =
                passengerRepository.findById(
                        passengerId
                ).orElseThrow(
                        () ->
                                new RuntimeException(
                                        "Passenger not found with ID: "
                                                + passengerId
                                )
                );




        Integer availableSeats =
                trip.getAvailableSeats();


        if (availableSeats == null) {

            throw new RuntimeException(
                    "Available seat information is missing for this trip"
            );

        }


        if (availableSeats <= 0) {

            throw new RuntimeException(
                    "No available seats for this trip"
            );

        }



        boolean seatAlreadyBooked =
                ticketRepository
                        .existsByTripTripIdAndSeatNumber(
                                tripId,
                                seatNumber
                        );


        if (seatAlreadyBooked) {

            throw new RuntimeException(
                    "Seat " +
                            seatNumber +
                            " is already booked for this trip"
            );

        }



        boolean passengerAlreadyBooked =
                ticketRepository
                        .existsByPassengerPassengerIdAndTripTripId(
                                passengerId,
                                tripId
                        );


        if (passengerAlreadyBooked) {

            throw new RuntimeException(
                    "This passenger already has a ticket for this trip"
            );

        }




        ticketDetails.setTrip(
                trip
        );


        ticketDetails.setPassenger(
                passenger
        );




        if (
                ticketDetails.getBookingDate()
                        == null
        ) {

            ticketDetails.setBookingDate(
                    LocalDateTime.now()
            );

        }



        String status =
                ticketDetails.getTicketStatus();


        if (
                status == null ||
                        status.trim().isEmpty()
        ) {

            ticketDetails.setTicketStatus(
                    "BOOKED"
            );

        }
        else {

            ticketDetails.setTicketStatus(
                    status.trim().toUpperCase()
            );

        }




        if (
                !"BOOKED".equals(
                        ticketDetails.getTicketStatus()
                )
        ) {

            throw new RuntimeException(
                    "New tickets must have BOOKED status"
            );

        }



        trip.setAvailableSeats(
                availableSeats - 1
        );




        tripRepository.save(
                trip
        );



        Ticket savedTicket;

        try {

            savedTicket =
                    ticketRepository.save(
                            ticketDetails
                    );

        }
        catch (Exception e) {

            /*
             * Give a more useful error message.
             */

            System.err.println(
                    "========================================"
            );

            System.err.println(
                    "TICKET SAVE FAILED"
            );

            System.err.println(
                    "Trip ID      : " +
                            tripId
            );

            System.err.println(
                    "Passenger ID : " +
                            passengerId
            );

            System.err.println(
                    "Seat Number  : " +
                            seatNumber
            );

            System.err.println(
                    "Ticket Price : " +
                            ticketPrice
            );

            System.err.println(
                    "Exception    : " +
                            e.getClass().getName()
            );

            System.err.println(
                    "Message      : " +
                            e.getMessage()
            );

            System.err.println(
                    "========================================"
            );

            e.printStackTrace();

            throw new RuntimeException(
                    "Unable to save ticket: " +
                            (
                                    e.getCause() != null
                                            ? e.getCause().getMessage()
                                            : e.getMessage()
                            ),
                    e
            );

        }



        return savedTicket;

    }


    @Transactional
    public Ticket updateTicket(
            Long id,
            Ticket ticketDetails
    ) {

        Ticket ticket =
                ticketRepository
                        .findById(id)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Ticket not found with ID: "
                                                        + id
                                        )
                        );


        if (
                ticketDetails.getSeatNumber() != null &&
                        !ticketDetails
                                .getSeatNumber()
                                .trim()
                                .isEmpty()
        ) {

            ticket.setSeatNumber(
                    ticketDetails
                            .getSeatNumber()
                            .trim()
                            .toUpperCase()
            );

        }


        if (
                ticketDetails.getTicketPrice()
                        != null
        ) {

            if (
                    ticketDetails
                            .getTicketPrice()
                            .compareTo(
                                    BigDecimal.ZERO
                            ) <= 0
            ) {

                throw new RuntimeException(
                        "Ticket price must be greater than zero"
                );

            }


            ticket.setTicketPrice(
                    ticketDetails
                            .getTicketPrice()
            );

        }


        if (
                ticketDetails.getTicketStatus()
                        != null
        ) {

            ticket.setTicketStatus(
                    ticketDetails
                            .getTicketStatus()
                            .trim()
                            .toUpperCase()
            );

        }


        return ticketRepository.save(
                ticket
        );

    }



    @Transactional
    public Ticket cancelTicket(
            Long id
    ) {

        Ticket ticket =
                ticketRepository
                        .findById(id)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Ticket not found with ID: "
                                                        + id
                                        )
                        );


        String currentStatus =
                ticket.getTicketStatus();


        if (
                "BOOKED".equals(
                        currentStatus
                )
        ) {

            Trip trip =
                    ticket.getTrip();


            if (trip != null) {

                Integer availableSeats =
                        trip.getAvailableSeats();


                if (availableSeats == null) {

                    availableSeats = 0;

                }


                trip.setAvailableSeats(
                        availableSeats + 1
                );


                tripRepository.save(
                        trip
                );

            }

        }


        ticket.setTicketStatus(
                "CANCELLED"
        );


        return ticketRepository.save(
                ticket
        );

    }


    @Transactional
    public void deleteTicket(
            Long id
    ) {

        Ticket ticket =
                ticketRepository
                        .findById(id)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Ticket not found with ID: "
                                                        + id
                                        )
                        );


        if (
                "BOOKED".equals(
                        ticket.getTicketStatus()
                )
        ) {

            Trip trip =
                    ticket.getTrip();


            if (trip != null) {

                Integer availableSeats =
                        trip.getAvailableSeats();


                if (availableSeats == null) {

                    availableSeats = 0;

                }


                trip.setAvailableSeats(
                        availableSeats + 1
                );


                tripRepository.save(
                        trip
                );

            }

        }


        ticketRepository.delete(
                ticket
        );

    }



    public List<Ticket> getTicketsByTrip(
            Long tripId
    ) {

        return ticketRepository
                .findByTripTripId(
                        tripId
                );

    }



    public List<Ticket> getTicketsByPassenger(
            Long passengerId
    ) {

        return ticketRepository
                .findByPassengerPassengerId(
                        passengerId
                );

    }



    public List<Ticket> getTicketsByStatus(
            String status
    ) {

        return ticketRepository
                .findByTicketStatus(
                        status
                );

    }

}