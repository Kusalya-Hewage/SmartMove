package com.smartmove.smartmove.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "ROUTE")
@Getter
@Setter
@NoArgsConstructor
public class Route {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ROUTE_ID")
    private Long routeId;

    @Column(name = "ROUTE_NAME", nullable = false, length = 100)
    private String routeName;

    @Column(name = "SOURCE_LOCATION", nullable = false, length = 100)
    private String sourceLocation;

    @Column(name = "DESTINATION_LOCATION", nullable = false, length = 100)
    private String destinationLocation;

    @Column(name = "DISTANCE_KM", nullable = false)
    private Double distanceKm;

    @Column(name = "ESTIMATED_DURATION_MIN", nullable = false)
    private Integer estimatedDurationMin;

    @Column(name = "BASE_FARE", nullable = false)
    private Double baseFare;

    @Column(name = "STATUS", nullable = false, length = 20)
    private String status;
}
