package com.smartmove.smartmove.service;

import com.smartmove.smartmove.entity.Route;
import com.smartmove.smartmove.entity.RouteStop;
import com.smartmove.smartmove.repository.RouteRepository;
import com.smartmove.smartmove.repository.RouteStopRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RouteService {

    private final RouteRepository routeRepository;
    private final RouteStopRepository routeStopRepository;

    public RouteService(
            RouteRepository routeRepository,
            RouteStopRepository routeStopRepository) {

        this.routeRepository = routeRepository;
        this.routeStopRepository = routeStopRepository;
    }



    // Get all routes
    public List<Route> getAllRoutes() {

        return routeRepository.findAll();
    }

    // Get route by ID
    public Route getRouteById(Long id) {

        return routeRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Route not found with ID: " + id
                        )
                );
    }

    // Create route
    public Route createRoute(Route route) {

        return routeRepository.save(route);
    }

    // Update route
    public Route updateRoute(Long id, Route routeDetails) {

        Route route = routeRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Route not found with ID: " + id
                        )
                );

        route.setRouteName(routeDetails.getRouteName());
        route.setSourceLocation(routeDetails.getSourceLocation());
        route.setDestinationLocation(
                routeDetails.getDestinationLocation()
        );
        route.setDistanceKm(routeDetails.getDistanceKm());
        route.setEstimatedDurationMin(
                routeDetails.getEstimatedDurationMin()
        );
        route.setBaseFare(routeDetails.getBaseFare());
        route.setStatus(routeDetails.getStatus());

        return routeRepository.save(route);
    }

    // Delete route
    public void deleteRoute(Long id) {

        if (!routeRepository.existsById(id)) {

            throw new RuntimeException(
                    "Route not found with ID: " + id
            );
        }

        routeRepository.deleteById(id);
    }




    // Get all stops for a route
    public List<RouteStop> getRouteStops(Long routeId) {

        if (!routeRepository.existsById(routeId)) {

            throw new RuntimeException(
                    "Route not found with ID: " + routeId
            );
        }

        return routeStopRepository
                .findByRouteRouteIdOrderByStopSequenceAsc(routeId);
    }

    // Add stop to a route
    public RouteStop addRouteStop(
            Long routeId,
            RouteStop routeStop) {

        Route route = routeRepository.findById(routeId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Route not found with ID: " + routeId
                        )
                );

        routeStop.setRoute(route);

        return routeStopRepository.save(routeStop);
    }

    // Get stop by ID
    public RouteStop getRouteStopById(Long stopId) {

        return routeStopRepository.findById(stopId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Route stop not found with ID: " + stopId
                        )
                );
    }

    // Update route stop
    public RouteStop updateRouteStop(
            Long stopId,
            RouteStop stopDetails) {

        RouteStop routeStop =
                routeStopRepository.findById(stopId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Route stop not found with ID: "
                                                + stopId
                                )
                        );

        routeStop.setStopName(stopDetails.getStopName());
        routeStop.setStopSequence(
                stopDetails.getStopSequence()
        );

        return routeStopRepository.save(routeStop);
    }

    // Delete route stop
    public void deleteRouteStop(Long stopId) {

        if (!routeStopRepository.existsById(stopId)) {

            throw new RuntimeException(
                    "Route stop not found with ID: " + stopId
            );
        }

        routeStopRepository.deleteById(stopId);
    }
}