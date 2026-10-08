package com.smartmove.smartmove.report.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class RevenueByMonthDTO {

    private String bookingMonth;
    private Long totalTickets;
    private BigDecimal totalRevenue;
}