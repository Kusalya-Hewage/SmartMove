package com.smartmove.smartmove.report.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class RevenueByRouteDTO {

    private Long routeId;
    private String routeName;
    private String sourceLocation;
    private String destinationLocation;
    private Long ticketsSold;
    private BigDecimal totalRevenue;
}
