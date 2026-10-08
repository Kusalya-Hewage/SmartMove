package com.smartmove.smartmove.repository;

import com.smartmove.smartmove.entity.RouteStop;
import com.smartmove.smartmove.repository.RouteRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RouteStopRepository extends JpaRepository<RouteStop, Long> {

    List<RouteStop> findByRouteRouteIdOrderByStopSequenceAsc(Long routeId);
}
