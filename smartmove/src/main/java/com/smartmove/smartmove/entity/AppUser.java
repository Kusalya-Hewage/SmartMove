package com.smartmove.smartmove.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "APP_USER")
@Getter
@Setter
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "USER_ID")
    private Long userId;

    @Column(name = "USERNAME", nullable = false, unique = true)
    private String username;

    @Column(name = "PASSWORD", nullable = false)
    private String password;

    @Column(name = "ROLE", nullable = false)
    private String role;

    @Column(name = "STATUS", nullable = false)
    private String status;

    @Column(name = "CREATED_DATE", nullable = false)
    private LocalDateTime createdDate;
}