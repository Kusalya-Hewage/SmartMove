package com.smartmove.smartmove.mongorepository;

import com.smartmove.smartmove.document.PassengerReview;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PassengerReviewRepository
        extends MongoRepository<PassengerReview, String> {

    List<PassengerReview> findByPassengerId(Long passengerId);

    boolean existsByPassengerIdAndTripId(
            Long passengerId,
            Long tripId
    );
}