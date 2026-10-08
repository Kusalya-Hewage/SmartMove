package com.smartmove.smartmove.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "TRIP")
@Getter
@Setter
@NoArgsConstructor
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TRIP_ID")
    private Long tripId;

    // Route relationship
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ROUTE_ID", nullable = false)
    private Route route;

    // Vehicle relationship
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "VEHICLE_ID", nullable = false)
    private Vehicle vehicle;

    // Driver relationship
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DRIVER_ID", nullable = false)
    private Driver driver;

    @Column(name = "TRIP_DATE", nullable = false)
    private LocalDate tripDate;

    @Column(name = "DEPARTURE_TIME", nullable = false)
    private LocalDateTime departureTime;

    @Column(name = "ARRIVAL_TIME")
    private LocalDateTime arrivalTime;

    @Column(name = "AVAILABLE_SEATS", nullable = false)
    private Integer availableSeats;

    @Column(name = "FARE", nullable = false, precision = 10, scale = 2)
    private BigDecimal fare;

    @Column(name = "TRIP_STATUS", nullable = false, length = 20)
    private String tripStatus;
}
