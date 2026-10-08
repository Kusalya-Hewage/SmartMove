package com.smartmove.smartmove.repository;

import com.smartmove.smartmove.entity.Route;
import com.smartmove.smartmove.repository.RouteRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RouteRepository extends JpaRepository<Route, Long> {
}
