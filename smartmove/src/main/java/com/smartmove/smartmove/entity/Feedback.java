package com.smartmove.smartmove.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "FEEDBACK")
@Getter
@Setter
@NoArgsConstructor
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "FEEDBACK_ID")
    private Long feedbackId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PASSENGER_ID", nullable = false)
    private Passenger passenger;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TRIP_ID", nullable = false)
    private Trip trip;

    @Column(name = "RATING", nullable = false)
    private Integer rating;

    @Column(name = "COMMENT_TEXT", length = 1000)
    private String commentText;

    @Column(name = "FEEDBACK_DATE", nullable = false)
    private LocalDateTime feedbackDate;
}
