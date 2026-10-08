package com.smartmove.smartmove.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "ROUTE_STOP",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "UK_ROUTE_STOP_SEQUENCE",
                        columnNames = {"ROUTE_ID", "STOP_SEQUENCE"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class RouteStop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "STOP_ID")
    private Long stopId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ROUTE_ID", nullable = false)
    private Route route;

    @Column(name = "STOP_NAME", nullable = false, length = 100)
    private String stopName;

    @Column(name = "STOP_SEQUENCE", nullable = false)
    private Integer stopSequence;
}
