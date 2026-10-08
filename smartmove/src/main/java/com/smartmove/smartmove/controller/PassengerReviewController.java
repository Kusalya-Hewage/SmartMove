package com.smartmove.smartmove.controller;

import com.smartmove.smartmove.document.PassengerReview;
import com.smartmove.smartmove.mongorepository.PassengerReviewRepository;
import com.smartmove.smartmove.repository.TicketRepository;

import jakarta.servlet.http.HttpSession;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mongo/reviews")
public class PassengerReviewController {

    private final PassengerReviewRepository passengerReviewRepository;

    private final TicketRepository ticketRepository;


    public PassengerReviewController(
            PassengerReviewRepository passengerReviewRepository,
            TicketRepository ticketRepository
    ) {

        this.passengerReviewRepository =
                passengerReviewRepository;

        this.ticketRepository =
                ticketRepository;
    }



    @GetMapping
    public ResponseEntity<List<PassengerReview>> getAllReviews() {

        return ResponseEntity.ok(
                passengerReviewRepository.findAll()
        );
    }



    @GetMapping("/my")
    public ResponseEntity<?> getMyReviews(
            HttpSession session
    ) {

        Long passengerId =
                getPassengerId(session);


        if (passengerId == null) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            Map.of(
                                    "success",
                                    false,
                                    "message",
                                    "Passenger is not logged in."
                            )
                    );
        }


        List<PassengerReview> reviews =
                passengerReviewRepository
                        .findByPassengerId(
                                passengerId
                        );


        return ResponseEntity.ok(
                reviews
        );
    }


    @GetMapping("/passenger/{passengerId}")
    public ResponseEntity<List<PassengerReview>> getReviewsByPassenger(
            @PathVariable Long passengerId
    ) {

        return ResponseEntity.ok(
                passengerReviewRepository
                        .findByPassengerId(
                                passengerId
                        )
        );
    }


    @PostMapping
    public ResponseEntity<?> createReview(
            @RequestBody PassengerReview review,
            HttpSession session
    ) {

        Long passengerId =
                getPassengerId(session);



        if (passengerId == null) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            Map.of(
                                    "success",
                                    false,
                                    "message",
                                    "Please login as a passenger."
                            )
                    );
        }


        if (review.getTripId() == null) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "success",
                                    false,
                                    "message",
                                    "Trip is required."
                            )
                    );
        }



        if (review.getRouteId() == null) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "success",
                                    false,
                                    "message",
                                    "Route is required."
                            )
                    );
        }


        if (
                review.getRating() == null ||
                        review.getRating() < 1 ||
                        review.getRating() > 5
        ) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "success",
                                    false,
                                    "message",
                                    "Rating must be between 1 and 5."
                            )
                    );
        }



        if (
                review.getComment() == null ||
                        review.getComment()
                                .trim()
                                .isEmpty()
        ) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "success",
                                    false,
                                    "message",
                                    "Comment is required."
                            )
                    );
        }



        boolean hasTicket =
                ticketRepository
                        .existsByPassengerPassengerIdAndTripTripId(
                                passengerId,
                                review.getTripId()
                        );


        if (!hasTicket) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            Map.of(
                                    "success",
                                    false,
                                    "message",
                                    "You can only review trips you have booked."
                            )
                    );
        }


        boolean alreadyReviewed =
                passengerReviewRepository
                        .existsByPassengerIdAndTripId(
                                passengerId,
                                review.getTripId()
                        );


        if (alreadyReviewed) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "success",
                                    false,
                                    "message",
                                    "You have already reviewed this trip."
                            )
                    );
        }



        review.setId(null);

        review.setPassengerId(
                passengerId
        );

        review.setReviewDate(
                LocalDateTime.now()
        );

        review.setStatus(
                "ACTIVE"
        );



        PassengerReview savedReview =
                passengerReviewRepository.save(
                        review
                );


        return ResponseEntity.ok(
                Map.of(
                        "success",
                        true,

                        "message",
                        "Review submitted successfully.",

                        "reviewId",
                        savedReview.getId()
                )
        );
    }



    private Long getPassengerId(
            HttpSession session
    ) {

        Object value =
                session.getAttribute(
                        "passengerId"
                );


        if (value == null) {

            return null;
        }


        try {

            return Long.parseLong(
                    String.valueOf(value)
            );

        } catch (Exception e) {

            return null;
        }
    }
}