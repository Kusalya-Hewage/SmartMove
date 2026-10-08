package com.smartmove.smartmove.report.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class VehicleMaintenanceDTO {

    private Long vehicleId;
    private String registrationNo;
    private String brand;
    private String model;
    private Long maintenanceCount;
    private BigDecimal totalMaintenanceCost;
}
