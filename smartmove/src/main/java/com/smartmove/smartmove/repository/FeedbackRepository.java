package com.smartmove.smartmove.repository;

import com.smartmove.smartmove.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository
        extends JpaRepository<Feedback, Long> {

    List<Feedback> findByPassengerPassengerId(Long passengerId);

    List<Feedback> findByTripTripId(Long tripId);

    List<Feedback> findByRating(Integer rating);

    List<Feedback> findByRatingGreaterThanEqual(Integer rating);
}