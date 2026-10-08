package com.smartmove.smartmove.controller;

import com.smartmove.smartmove.entity.Route;
import com.smartmove.smartmove.entity.RouteStop;
import com.smartmove.smartmove.service.RouteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/routes")
@CrossOrigin(origins = "*")
public class RouteController {

    private final RouteService routeService;

    public RouteController(RouteService routeService) {
        this.routeService = routeService;
    }



    // GET all routes
    @GetMapping
    public ResponseEntity<List<Route>> getAllRoutes() {

        return ResponseEntity.ok(
                routeService.getAllRoutes()
        );
    }

    // GET route by ID
    @GetMapping("/{id}")
    public ResponseEntity<Route> getRouteById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                routeService.getRouteById(id)
        );
    }

    // POST create route
    @PostMapping
    public ResponseEntity<Route> createRoute(
            @RequestBody Route route) {

        Route savedRoute =
                routeService.createRoute(route);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedRoute);
    }

    // PUT update route
    @PutMapping("/{id}")
    public ResponseEntity<Route> updateRoute(
            @PathVariable Long id,
            @RequestBody Route route) {

        Route updatedRoute =
                routeService.updateRoute(id, route);

        return ResponseEntity.ok(updatedRoute);
    }

    // DELETE route
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteRoute(
            @PathVariable Long id) {

        routeService.deleteRoute(id);

        return ResponseEntity.ok(
                "Route deleted successfully"
        );
    }


    // ==========================================
    // ROUTE STOP ENDPOINTS
    // ==========================================

    // GET all stops for a route
    @GetMapping("/{routeId}/stops")
    public ResponseEntity<List<RouteStop>> getRouteStops(
            @PathVariable Long routeId) {

        return ResponseEntity.ok(
                routeService.getRouteStops(routeId)
        );
    }

    // POST add stop to route
    @PostMapping("/{routeId}/stops")
    public ResponseEntity<RouteStop> addRouteStop(
            @PathVariable Long routeId,
            @RequestBody RouteStop routeStop) {

        RouteStop savedStop =
                routeService.addRouteStop(
                        routeId,
                        routeStop
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedStop);
    }

    // GET route stop by ID
    @GetMapping("/stops/{stopId}")
    public ResponseEntity<RouteStop> getRouteStopById(
            @PathVariable Long stopId) {

        return ResponseEntity.ok(
                routeService.getRouteStopById(stopId)
        );
    }

    // PUT update route stop
    @PutMapping("/stops/{stopId}")
    public ResponseEntity<RouteStop> updateRouteStop(
            @PathVariable Long stopId,
            @RequestBody RouteStop routeStop) {

        RouteStop updatedStop =
                routeService.updateRouteStop(
                        stopId,
                        routeStop
                );

        return ResponseEntity.ok(updatedStop);
    }

    // DELETE route stop
    @DeleteMapping("/stops/{stopId}")
    public ResponseEntity<String> deleteRouteStop(
            @PathVariable Long stopId) {

        routeService.deleteRouteStop(stopId);

        return ResponseEntity.ok(
                "Route stop deleted successfully"
        );
    }
}
