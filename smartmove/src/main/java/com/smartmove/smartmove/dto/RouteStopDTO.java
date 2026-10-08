package com.smartmove.smartmove.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RouteStopDTO {

    private Long stopId;

    private Long routeId;

    private String stopName;

    private Integer stopSequence;
}
