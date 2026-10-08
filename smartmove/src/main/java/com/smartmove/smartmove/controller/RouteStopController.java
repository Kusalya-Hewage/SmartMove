package com.smartmove.smartmove.controller;

import com.smartmove.smartmove.dto.RouteStopDTO;
import com.smartmove.smartmove.service.RouteStopService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/route-stops")
public class RouteStopController {

    private final RouteStopService routeStopService;

    public RouteStopController(
            RouteStopService routeStopService) {

        this.routeStopService =
                routeStopService;
    }



    @GetMapping
    public ResponseEntity<List<RouteStopDTO>>
    getAllRouteStops() {

        return ResponseEntity.ok(
                routeStopService
                        .getAllRouteStops()
        );
    }



    @GetMapping("/{id}")
    public ResponseEntity<RouteStopDTO>
    getRouteStopById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                routeStopService
                        .getRouteStopById(id)
        );
    }



    @GetMapping("/route/{routeId}")
    public ResponseEntity<List<RouteStopDTO>>
    getRouteStopsByRouteId(
            @PathVariable Long routeId) {

        return ResponseEntity.ok(
                routeStopService
                        .getRouteStopsByRouteId(
                                routeId
                        )
        );
    }



    @PostMapping
    public ResponseEntity<RouteStopDTO>
    createRouteStop(
            @RequestBody RouteStopDTO request) {

        RouteStopDTO created =
                routeStopService
                        .createRouteStop(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(created);
    }



    @PutMapping("/{id}")
    public ResponseEntity<RouteStopDTO>
    updateRouteStop(
            @PathVariable Long id,
            @RequestBody RouteStopDTO request) {

        return ResponseEntity.ok(
                routeStopService
                        .updateRouteStop(
                                id,
                                request
                        )
        );
    }



    @DeleteMapping("/{id}")
    public ResponseEntity<String>
    deleteRouteStop(
            @PathVariable Long id) {

        routeStopService
                .deleteRouteStop(id);

        return ResponseEntity.ok(
                "Route stop deleted successfully."
        );
    }
}
