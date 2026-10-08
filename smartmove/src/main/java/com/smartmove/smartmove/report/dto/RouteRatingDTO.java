package com.smartmove.smartmove.report.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class RouteRatingDTO {

    private Long routeId;
    private String routeName;
    private Long totalFeedback;
    private BigDecimal averageRating;
    private Integer lowestRating;
    private Integer highestRating;
}
