package com.smartmove.smartmove.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "PASSENGER")
@Getter
@Setter
@NoArgsConstructor
public class Passenger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PASSENGER_ID")
    private Long passengerId;

    @Column(name = "FULL_NAME", nullable = false, length = 100)
    private String fullName;

    @Column(name = "EMAIL", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "PHONE", length = 20)
    private String phone;

    @Column(name = "PASSWORD", nullable = false, length = 100)
    private String password;

    @Column(name = "ADDRESS", length = 255)
    private String address;

    @Column(name = "REGISTRATION_DATE", nullable = false)
    private LocalDate registrationDate;

    @Column(name = "STATUS", nullable = false, length = 20)
    private String status;
}
