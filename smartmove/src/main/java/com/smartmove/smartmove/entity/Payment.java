package com.smartmove.smartmove.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "PAYMENT")
@Getter
@Setter
@NoArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PAYMENT_ID")
    private Long paymentId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TICKET_ID", nullable = false, unique = true)
    private Ticket ticket;

    @Column(
            name = "AMOUNT",
            nullable = false,
            precision = 10,
            scale = 2
    )
    private BigDecimal amount;

    @Column(name = "PAYMENT_DATE", nullable = false)
    private LocalDateTime paymentDate;

    @Column(name = "PAYMENT_METHOD", nullable = false, length = 20)
    private String paymentMethod;

    @Column(name = "PAYMENT_STATUS", nullable = false, length = 20)
    private String paymentStatus;

    @Column(
            name = "TRANSACTION_REFERENCE",
            unique = true,
            length = 100
    )
    private String transactionReference;
}
