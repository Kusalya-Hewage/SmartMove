package com.smartmove.smartmove.repository;

import com.smartmove.smartmove.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {

    List<Trip> findByTripDate(LocalDate tripDate);

    List<Trip> findByTripStatus(String tripStatus);

    List<Trip> findByRouteRouteId(Long routeId);

    List<Trip> findByVehicleVehicleId(Long vehicleId);

    List<Trip> findByDriverDriverId(Long driverId);
}
