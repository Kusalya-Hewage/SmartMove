package com.smartmove.smartmove.repository;

import com.smartmove.smartmove.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Long> {

    Optional<Driver> findByNicNumber(String nicNumber);

    Optional<Driver> findByLicenseNumber(String licenseNumber);
}
