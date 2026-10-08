package com.smartmove.smartmove.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "DRIVER")
@Getter
@Setter
@NoArgsConstructor
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "DRIVER_ID")
    private Long driverId;

    @Column(name = "FIRST_NAME", nullable = false, length = 50)
    private String firstName;

    @Column(name = "LAST_NAME", nullable = false, length = 50)
    private String lastName;

    @Column(name = "NIC_NUMBER", nullable = false, unique = true, length = 20)
    private String nicNumber;

    @Column(name = "LICENSE_NUMBER", nullable = false, unique = true, length = 30)
    private String licenseNumber;

    @Column(name = "LICENSE_EXPIRY")
    private LocalDate licenseExpiry;

    @Column(name = "PHONE", length = 20)
    private String phone;

    @Column(name = "EMAIL", length = 100)
    private String email;

    @Column(name = "DATE_OF_BIRTH")
    private LocalDate dateOfBirth;

    @Column(name = "HIRE_DATE", nullable = false)
    private LocalDate hireDate;

    @Column(name = "STATUS", nullable = false, length = 20)
    private String status;
}
