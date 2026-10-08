package com.smartmove.smartmove.service;

import com.smartmove.smartmove.entity.Driver;
import com.smartmove.smartmove.entity.Route;
import com.smartmove.smartmove.entity.Trip;
import com.smartmove.smartmove.entity.Vehicle;
import com.smartmove.smartmove.repository.DriverRepository;
import com.smartmove.smartmove.repository.RouteRepository;
import com.smartmove.smartmove.repository.TripRepository;
import com.smartmove.smartmove.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class TripService {

    private final TripRepository tripRepository;
    private final RouteRepository routeRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;

    public TripService(
            TripRepository tripRepository,
            RouteRepository routeRepository,
            VehicleRepository vehicleRepository,
            DriverRepository driverRepository) {

        this.tripRepository = tripRepository;
        this.routeRepository = routeRepository;
        this.vehicleRepository = vehicleRepository;
        this.driverRepository = driverRepository;
    }



    public List<Trip> getAllTrips() {

        return tripRepository.findAll();
    }



    public Trip getTripById(Long id) {

        return tripRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Trip not found with ID: " + id
                        )
                );
    }



    public Trip createTrip(
            Long routeId,
            Long vehicleId,
            Long driverId,
            Trip tripDetails) {

        Route route = routeRepository.findById(routeId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Route not found with ID: " + routeId
                        )
                );

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Vehicle not found with ID: " + vehicleId
                        )
                );

        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Driver not found with ID: " + driverId
                        )
                );

        tripDetails.setRoute(route);
        tripDetails.setVehicle(vehicle);
        tripDetails.setDriver(driver);

        return tripRepository.save(tripDetails);
    }



    public Trip updateTrip(
            Long id,
            Long routeId,
            Long vehicleId,
            Long driverId,
            Trip tripDetails) {

        Trip trip = tripRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Trip not found with ID: " + id
                        )
                );

        Route route = routeRepository.findById(routeId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Route not found with ID: " + routeId
                        )
                );

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Vehicle not found with ID: " + vehicleId
                        )
                );

        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Driver not found with ID: " + driverId
                        )
                );

        trip.setRoute(route);
        trip.setVehicle(vehicle);
        trip.setDriver(driver);

        trip.setTripDate(
                tripDetails.getTripDate()
        );

        trip.setDepartureTime(
                tripDetails.getDepartureTime()
        );

        trip.setArrivalTime(
                tripDetails.getArrivalTime()
        );

        trip.setAvailableSeats(
                tripDetails.getAvailableSeats()
        );

        trip.setFare(
                tripDetails.getFare()
        );

        trip.setTripStatus(
                tripDetails.getTripStatus()
        );

        return tripRepository.save(trip);
    }



    public void deleteTrip(Long id) {

        if (!tripRepository.existsById(id)) {

            throw new RuntimeException(
                    "Trip not found with ID: " + id
            );
        }

        tripRepository.deleteById(id);
    }



    public List<Trip> getTripsByDate(LocalDate date) {

        return tripRepository.findByTripDate(date);
    }



    public List<Trip> getTripsByStatus(String status) {

        return tripRepository.findByTripStatus(status);
    }



    public List<Trip> getTripsByRoute(Long routeId) {

        return tripRepository.findByRouteRouteId(routeId);
    }



    public List<Trip> getTripsByVehicle(Long vehicleId) {

        return tripRepository.findByVehicleVehicleId(vehicleId);
    }



    public List<Trip> getTripsByDriver(Long driverId) {

        return tripRepository.findByDriverDriverId(driverId);
    }
}
