package com.smartmove.smartmove.service;

import com.smartmove.smartmove.entity.Driver;
import com.smartmove.smartmove.repository.DriverRepository;
import com.smartmove.smartmove.repository.DriverRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DriverService {

    private final DriverRepository driverRepository;

    public DriverService(DriverRepository driverRepository) {
        this.driverRepository = driverRepository;
    }

    // Get all drivers
    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }

    // Get driver by ID
    public Driver getDriverById(Long id) {

        return driverRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Driver not found with ID: " + id
                        )
                );
    }

    // Create driver
    public Driver createDriver(Driver driver) {

        return driverRepository.save(driver);
    }

    // Update driver
    public Driver updateDriver(Long id, Driver driverDetails) {

        Driver driver = driverRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Driver not found with ID: " + id
                        )
                );

        driver.setFirstName(driverDetails.getFirstName());
        driver.setLastName(driverDetails.getLastName());
        driver.setNicNumber(driverDetails.getNicNumber());
        driver.setLicenseNumber(driverDetails.getLicenseNumber());
        driver.setLicenseExpiry(driverDetails.getLicenseExpiry());
        driver.setPhone(driverDetails.getPhone());
        driver.setEmail(driverDetails.getEmail());
        driver.setDateOfBirth(driverDetails.getDateOfBirth());
        driver.setHireDate(driverDetails.getHireDate());
        driver.setStatus(driverDetails.getStatus());

        return driverRepository.save(driver);
    }

    // Delete driver
    public void deleteDriver(Long id) {

        if (!driverRepository.existsById(id)) {

            throw new RuntimeException(
                    "Driver not found with ID: " + id
            );
        }

        driverRepository.deleteById(id);
    }
}