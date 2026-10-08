package com.smartmove.smartmove.controller;

import com.smartmove.smartmove.entity.Feedback;
import com.smartmove.smartmove.service.FeedbackService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "*")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(
            FeedbackService feedbackService) {

        this.feedbackService = feedbackService;
    }


    @GetMapping
    public ResponseEntity<List<Feedback>> getAllFeedback() {

        return ResponseEntity.ok(
                feedbackService.getAllFeedback()
        );
    }


    @GetMapping("/{id}")
    public ResponseEntity<Feedback> getFeedbackById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                feedbackService.getFeedbackById(id)
        );
    }

    @PostMapping
    public ResponseEntity<Feedback> createFeedback(
            @RequestParam Long passengerId,
            @RequestParam Long tripId,
            @RequestBody Feedback feedback) {

        Feedback savedFeedback =
                feedbackService.createFeedback(
                        passengerId,
                        tripId,
                        feedback
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedFeedback);
    }


    @PutMapping("/{id}")
    public ResponseEntity<Feedback> updateFeedback(
            @PathVariable Long id,
            @RequestBody Feedback feedback) {

        return ResponseEntity.ok(
                feedbackService.updateFeedback(
                        id,
                        feedback
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteFeedback(
            @PathVariable Long id) {

        feedbackService.deleteFeedback(id);

        return ResponseEntity.ok(
                "Feedback deleted successfully"
        );
    }


    @GetMapping("/passenger/{passengerId}")
    public ResponseEntity<List<Feedback>>
    getFeedbackByPassenger(
            @PathVariable Long passengerId) {

        return ResponseEntity.ok(
                feedbackService.getFeedbackByPassenger(
                        passengerId
                )
        );
    }


    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<Feedback>>
    getFeedbackByTrip(
            @PathVariable Long tripId) {

        return ResponseEntity.ok(
                feedbackService.getFeedbackByTrip(
                        tripId
                )
        );
    }

    @GetMapping("/rating/{rating}")
    public ResponseEntity<List<Feedback>>
    getFeedbackByRating(
            @PathVariable Integer rating) {

        return ResponseEntity.ok(
                feedbackService.getFeedbackByRating(
                        rating
                )
        );
    }


    @GetMapping("/rating/min/{rating}")
    public ResponseEntity<List<Feedback>>
    getHighRatedFeedback(
            @PathVariable Integer rating) {

        return ResponseEntity.ok(
                feedbackService.getHighRatedFeedback(
                        rating
                )
        );
    }
}
