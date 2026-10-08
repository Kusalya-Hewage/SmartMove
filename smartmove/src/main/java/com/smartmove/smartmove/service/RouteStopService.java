package com.smartmove.smartmove.service;

import com.smartmove.smartmove.dto.RouteStopDTO;
import com.smartmove.smartmove.entity.Route;
import com.smartmove.smartmove.entity.RouteStop;
import com.smartmove.smartmove.repository.RouteRepository;
import com.smartmove.smartmove.repository.RouteStopRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RouteStopService {

    private final RouteStopRepository routeStopRepository;

    private final RouteRepository routeRepository;

    public RouteStopService(
            RouteStopRepository routeStopRepository,
            RouteRepository routeRepository) {

        this.routeStopRepository =
                routeStopRepository;

        this.routeRepository =
                routeRepository;
    }



    public List<RouteStopDTO> getAllRouteStops() {

        return routeStopRepository
                .findAll()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }



    public RouteStopDTO getRouteStopById(
            Long stopId) {

        RouteStop stop =
                routeStopRepository
                        .findById(stopId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Route stop not found with ID: "
                                                + stopId
                                )
                        );

        return convertToDTO(stop);
    }



    public List<RouteStopDTO> getRouteStopsByRouteId(
            Long routeId) {

        validateRoute(routeId);

        return routeStopRepository
                .findByRouteRouteIdOrderByStopSequenceAsc(
                        routeId
                )
                .stream()
                .map(this::convertToDTO)
                .toList();
    }




    public RouteStopDTO createRouteStop(
            RouteStopDTO request) {

        if (request.getRouteId() == null) {

            throw new RuntimeException(
                    "Route ID is required."
            );
        }

        if (request.getStopName() == null
                || request.getStopName().isBlank()) {

            throw new RuntimeException(
                    "Stop name is required."
            );
        }

        if (request.getStopSequence() == null
                || request.getStopSequence() < 1) {

            throw new RuntimeException(
                    "Stop sequence must be greater than 0."
            );
        }


        Route route =
                validateRoute(
                        request.getRouteId()
                );


        boolean sequenceExists =
                routeStopRepository
                        .findByRouteRouteIdOrderByStopSequenceAsc(
                                request.getRouteId()
                        )
                        .stream()
                        .anyMatch(stop ->
                                stop.getStopSequence()
                                        .equals(
                                                request.getStopSequence()
                                        )
                        );


        if (sequenceExists) {

            throw new RuntimeException(
                    "Stop sequence "
                            + request.getStopSequence()
                            + " already exists for this route."
            );
        }


        RouteStop stop =
                new RouteStop();

        stop.setRoute(route);

        stop.setStopName(
                request.getStopName().trim()
        );

        stop.setStopSequence(
                request.getStopSequence()
        );


        RouteStop saved =
                routeStopRepository.save(stop);


        return convertToDTO(saved);
    }



    public RouteStopDTO updateRouteStop(
            Long stopId,
            RouteStopDTO request) {

        RouteStop existing =
                routeStopRepository
                        .findById(stopId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Route stop not found with ID: "
                                                + stopId
                                )
                        );


        if (request.getRouteId() == null) {

            throw new RuntimeException(
                    "Route ID is required."
            );
        }


        if (request.getStopName() == null
                || request.getStopName().isBlank()) {

            throw new RuntimeException(
                    "Stop name is required."
            );
        }


        if (request.getStopSequence() == null
                || request.getStopSequence() < 1) {

            throw new RuntimeException(
                    "Stop sequence must be greater than 0."
            );
        }


        Route route =
                validateRoute(
                        request.getRouteId()
                );



        boolean sequenceExists =
                routeStopRepository
                        .findByRouteRouteIdOrderByStopSequenceAsc(
                                request.getRouteId()
                        )
                        .stream()
                        .anyMatch(stop ->
                                !stop.getStopId()
                                        .equals(stopId)
                                        &&
                                        stop.getStopSequence()
                                                .equals(
                                                        request.getStopSequence()
                                                )
                        );


        if (sequenceExists) {

            throw new RuntimeException(
                    "Stop sequence "
                            + request.getStopSequence()
                            + " already exists for this route."
            );
        }


        existing.setRoute(route);

        existing.setStopName(
                request.getStopName().trim()
        );

        existing.setStopSequence(
                request.getStopSequence()
        );


        RouteStop updated =
                routeStopRepository.save(
                        existing
                );


        return convertToDTO(updated);
    }



    public void deleteRouteStop(
            Long stopId) {

        RouteStop stop =
                routeStopRepository
                        .findById(stopId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Route stop not found with ID: "
                                                + stopId
                                )
                        );

        routeStopRepository.delete(stop);
    }


    private Route validateRoute(
            Long routeId) {

        return routeRepository
                .findById(routeId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Route not found with ID: "
                                        + routeId
                        )
                );
    }




    private RouteStopDTO convertToDTO(
            RouteStop stop) {

        return new RouteStopDTO(

                stop.getStopId(),

                stop.getRoute()
                        .getRouteId(),

                stop.getStopName(),

                stop.getStopSequence()
        );
    }
}
