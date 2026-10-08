package com.smartmove.smartmove.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RatingSummary {

    private Double averageRating;

    private Long totalReviews;

    public RatingSummary() {
    }

    public RatingSummary(
            Double averageRating,
            Long totalReviews) {

        this.averageRating = averageRating;
        this.totalReviews = totalReviews;
    }
}
