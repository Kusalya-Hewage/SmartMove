package com.smartmove.smartmove.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "TICKET",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "UK_TICKET_TRIP_SEAT",
                        columnNames = {
                                "TRIP_ID",
                                "SEAT_NUMBER"
                        }
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class Ticket {



    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    @Column(
            name = "TICKET_ID"
    )
    private Long ticketId;


    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "TRIP_ID",
            nullable = false
    )
    private Trip trip;



    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "PASSENGER_ID",
            nullable = false
    )
    private Passenger passenger;


    @Column(
            name = "SEAT_NUMBER",
            nullable = false,
            length = 10
    )
    private String seatNumber;

    @Column(
            name = "BOOKING_DATE",
            nullable = false
    )
    private LocalDateTime bookingDate;


    @Column(
            name = "TICKET_PRICE",
            nullable = false,
            precision = 10,
            scale = 2
    )
    private BigDecimal ticketPrice;


    @Column(
            name = "TICKET_STATUS",
            nullable = false,
            length = 20
    )
    private String ticketStatus;

}