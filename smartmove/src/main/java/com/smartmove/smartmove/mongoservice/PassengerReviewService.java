package com.smartmove.smartmove.mongoservice;

import com.smartmove.smartmove.document.PassengerReview;
import com.smartmove.smartmove.entity.Passenger;
import com.smartmove.smartmove.entity.Trip;
import com.smartmove.smartmove.mongorepository.PassengerReviewRepository;
import com.smartmove.smartmove.repository.PassengerRepository;
import com.smartmove.smartmove.repository.TicketRepository;
import com.smartmove.smartmove.repository.TripRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PassengerReviewService {

    private final PassengerReviewRepository repository;
    private final PassengerRepository passengerRepository;
    private final TripRepository tripRepository;
    private final TicketRepository ticketRepository;

    public PassengerReviewService(
            PassengerReviewRepository repository,
            PassengerRepository passengerRepository,
            TripRepository tripRepository,
            TicketRepository ticketRepository) {

        this.repository = repository;
        this.passengerRepository = passengerRepository;
        this.tripRepository = tripRepository;
        this.ticketRepository = ticketRepository;
    }


    public List<PassengerReview> getAllReviews() {
        return repository.findAll();
    }


    public PassengerReview createReview(PassengerReview review) {


        if (review.getPassengerId() == null) {
            throw new RuntimeException(
                    "Passenger ID is required."
            );
        }


        if (review.getTripId() == null) {
            throw new RuntimeException(
                    "Trip ID is required."
            );
        }


        if (review.getRating() == null) {
            throw new RuntimeException(
                    "Rating is required."
            );
        }

        if (review.getRating() < 1 ||
                review.getRating() > 5) {

            throw new RuntimeException(
                    "Rating must be between 1 and 5."
            );
        }


        Passenger passenger = passengerRepository
                .findById(review.getPassengerId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Passenger not found with ID: "
                                        + review.getPassengerId()
                        )
                );


        Trip trip = tripRepository
                .findById(review.getTripId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Trip not found with ID: "
                                        + review.getTripId()
                        )
                );


        boolean hasTicket =
                ticketRepository
                        .existsByPassengerPassengerIdAndTripTripId(
                                review.getPassengerId(),
                                review.getTripId()
                        );

        if (!hasTicket) {
            throw new RuntimeException(
                    "Passenger cannot review a trip they have not booked."
            );
        }


        if (trip.getRoute() == null) {
            throw new RuntimeException(
                    "The selected trip has no route."
            );
        }

        review.setRouteId(
                trip.getRoute().getRouteId()
        );


        if (review.getReviewDate() == null) {
            review.setReviewDate(
                    LocalDateTime.now()
            );
        }


        if (review.getStatus() == null ||
                review.getStatus().isBlank()) {

            review.setStatus("VISIBLE");
        }


        return repository.save(review);
    }

}