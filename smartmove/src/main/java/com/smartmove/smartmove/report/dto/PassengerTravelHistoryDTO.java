package com.smartmove.smartmove.report.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.sql.Date;

@Getter
@AllArgsConstructor
public class PassengerTravelHistoryDTO {

    private Long passengerId;
    private String fullName;
    private Long ticketId;
    private Date tripDate;
    private String routeName;
    private String sourceLocation;
    private String destinationLocation;
    private String seatNumber;
    private BigDecimal ticketPrice;
    private String ticketStatus;
}
