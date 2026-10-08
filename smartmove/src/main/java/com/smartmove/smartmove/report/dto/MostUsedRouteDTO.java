package com.smartmove.smartmove.report.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MostUsedRouteDTO {

    private Long routeId;
    private String routeName;
    private String sourceLocation;
    private String destinationLocation;
    private Long totalTickets;
}
