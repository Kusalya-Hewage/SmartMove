package com.smartmove.smartmove.report.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DriverPerformanceDTO {

    private Long driverId;
    private String driverName;
    private Long totalTrips;
    private Long completedTrips;
    private Long cancelledTrips;
}
