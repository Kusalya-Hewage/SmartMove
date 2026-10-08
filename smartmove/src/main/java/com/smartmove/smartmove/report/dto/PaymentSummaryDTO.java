package com.smartmove.smartmove.report.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class PaymentSummaryDTO {

    private String paymentMethod;
    private String paymentStatus;
    private Long paymentCount;
    private BigDecimal totalAmount;
}
