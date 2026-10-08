package com.smartmove.smartmove.service;

import com.smartmove.smartmove.entity.Vehicle;
import com.smartmove.smartmove.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    // Get all vehicles
    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    // Get vehicle by ID
    public Vehicle getVehicleById(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Vehicle not found with ID: " + id));
    }

    // Add new vehicle
    public Vehicle createVehicle(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    // Update vehicle
    public Vehicle updateVehicle(Long id, Vehicle vehicleDetails) {

        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Vehicle not found with ID: " + id));

        vehicle.setRegistrationNo(vehicleDetails.getRegistrationNo());
        vehicle.setVehicleType(vehicleDetails.getVehicleType());
        vehicle.setBrand(vehicleDetails.getBrand());
        vehicle.setModel(vehicleDetails.getModel());
        vehicle.setManufactureYear(vehicleDetails.getManufactureYear());
        vehicle.setSeatingCapacity(vehicleDetails.getSeatingCapacity());
        vehicle.setStatus(vehicleDetails.getStatus());
        vehicle.setInsuranceExpiry(vehicleDetails.getInsuranceExpiry());

        return vehicleRepository.save(vehicle);
    }

    // Delete vehicle
    public void deleteVehicle(Long id) {

        if (!vehicleRepository.existsById(id)) {
            throw new RuntimeException(
                    "Vehicle not found with ID: " + id
            );
        }

        vehicleRepository.deleteById(id);
    }
}
