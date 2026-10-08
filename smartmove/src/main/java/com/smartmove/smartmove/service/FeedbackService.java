package com.smartmove.smartmove.service;

import com.smartmove.smartmove.entity.Feedback;
import com.smartmove.smartmove.entity.Passenger;
import com.smartmove.smartmove.entity.Trip;
import com.smartmove.smartmove.repository.FeedbackRepository;
import com.smartmove.smartmove.repository.PassengerRepository;
import com.smartmove.smartmove.repository.TripRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final PassengerRepository passengerRepository;
    private final TripRepository tripRepository;

    public FeedbackService(
            FeedbackRepository feedbackRepository,
            PassengerRepository passengerRepository,
            TripRepository tripRepository) {

        this.feedbackRepository = feedbackRepository;
        this.passengerRepository = passengerRepository;
        this.tripRepository = tripRepository;
    }


    public List<Feedback> getAllFeedback() {

        return feedbackRepository.findAll();
    }



    public Feedback getFeedbackById(Long id) {

        return feedbackRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Feedback not found with ID: " + id
                        )
                );
    }



    public Feedback createFeedback(
            Long passengerId,
            Long tripId,
            Feedback feedbackDetails) {

        Passenger passenger =
                passengerRepository.findById(passengerId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Passenger not found with ID: "
                                                + passengerId
                                )
                        );

        Trip trip =
                tripRepository.findById(tripId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Trip not found with ID: "
                                                + tripId
                                )
                        );

        // Validate rating
        if (feedbackDetails.getRating() == null ||
                feedbackDetails.getRating() < 1 ||
                feedbackDetails.getRating() > 5) {

            throw new RuntimeException(
                    "Rating must be between 1 and 5"
            );
        }

        feedbackDetails.setPassenger(passenger);
        feedbackDetails.setTrip(trip);

        // Set date automatically
        if (feedbackDetails.getFeedbackDate() == null) {

            feedbackDetails.setFeedbackDate(
                    LocalDateTime.now()
            );
        }

        return feedbackRepository.save(feedbackDetails);
    }



    public Feedback updateFeedback(
            Long id,
            Feedback feedbackDetails) {

        Feedback feedback =
                feedbackRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Feedback not found with ID: "
                                                + id
                                )
                        );

        if (feedbackDetails.getRating() == null ||
                feedbackDetails.getRating() < 1 ||
                feedbackDetails.getRating() > 5) {

            throw new RuntimeException(
                    "Rating must be between 1 and 5"
            );
        }

        feedback.setRating(
                feedbackDetails.getRating()
        );

        feedback.setCommentText(
                feedbackDetails.getCommentText()
        );

        return feedbackRepository.save(feedback);
    }


    public void deleteFeedback(Long id) {

        if (!feedbackRepository.existsById(id)) {

            throw new RuntimeException(
                    "Feedback not found with ID: " + id
            );
        }

        feedbackRepository.deleteById(id);
    }


    public List<Feedback> getFeedbackByPassenger(
            Long passengerId) {

        return feedbackRepository
                .findByPassengerPassengerId(passengerId);
    }


    public List<Feedback> getFeedbackByTrip(
            Long tripId) {

        return feedbackRepository
                .findByTripTripId(tripId);
    }



    public List<Feedback> getFeedbackByRating(
            Integer rating) {

        return feedbackRepository.findByRating(rating);
    }



    public List<Feedback> getHighRatedFeedback(
            Integer rating) {

        return feedbackRepository
                .findByRatingGreaterThanEqual(rating);
    }
}
