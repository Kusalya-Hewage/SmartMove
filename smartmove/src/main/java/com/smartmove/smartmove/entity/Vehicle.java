package com.smartmove.smartmove.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "VEHICLE")
@Getter
@Setter
@NoArgsConstructor
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "VEHICLE_ID")
    private Long vehicleId;

    @Column(name = "REGISTRATION_NO", nullable = false, unique = true, length = 20)
    private String registrationNo;

    @Column(name = "VEHICLE_TYPE", nullable = false, length = 20)
    private String vehicleType;

    @Column(name = "BRAND", length = 50)
    private String brand;

    @Column(name = "MODEL", length = 50)
    private String model;

    @Column(name = "MANUFACTURE_YEAR")
    private Integer manufactureYear;

    @Column(name = "SEATING_CAPACITY", nullable = false)
    private Integer seatingCapacity;

    @Column(name = "STATUS", nullable = false, length = 20)
    private String status;

    @Column(name = "INSURANCE_EXPIRY")
    private LocalDate insuranceExpiry;

    @Column(
            name = "CREATED_DATE",
            nullable = false,
            insertable = false,
            updatable = false
    )
    private LocalDateTime createdDate;
}
