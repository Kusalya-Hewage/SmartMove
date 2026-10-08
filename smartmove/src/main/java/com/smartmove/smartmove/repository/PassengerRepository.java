package com.smartmove.smartmove.repository;

import com.smartmove.smartmove.entity.Passenger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PassengerRepository
        extends JpaRepository<Passenger, Long> {

    Optional<Passenger> findByEmailIgnoreCase(String email);

    boolean existsByEmail(String email);
}