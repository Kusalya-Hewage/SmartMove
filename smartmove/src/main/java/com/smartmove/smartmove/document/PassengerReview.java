package com.smartmove.smartmove.document;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Document(collection = "passenger_reviews")
public class PassengerReview {

    @Id
    private String id;

    private Long passengerId;

    private Long tripId;

    private Long routeId;

    private Integer rating;

    private String comment;

    private LocalDateTime reviewDate;

    private String status;
}