package com.smartmove.smartmove.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "MAINTENANCE")
@Getter
@Setter
@NoArgsConstructor
public class Maintenance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MAINTENANCE_ID")
    private Long maintenanceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "VEHICLE_ID", nullable = false)
    private Vehicle vehicle;

    @Column(name = "MAINTENANCE_DATE", nullable = false)
    private LocalDate maintenanceDate;

    @Column(name = "MAINTENANCE_TYPE", nullable = false, length = 50)
    private String maintenanceType;

    @Column(name = "DESCRIPTION", length = 500)
    private String description;

    @Column(
            name = "COST",
            nullable = false,
            precision = 10,
            scale = 2
    )
    private BigDecimal cost;

    @Column(
            name = "MAINTENANCE_STATUS",
            nullable = false,
            length = 20
    )
    private String maintenanceStatus;
}
