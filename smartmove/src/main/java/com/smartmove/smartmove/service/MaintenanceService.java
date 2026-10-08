package com.smartmove.smartmove.service;

import com.smartmove.smartmove.entity.Maintenance;
import com.smartmove.smartmove.entity.Vehicle;
import com.smartmove.smartmove.repository.MaintenanceRepository;
import com.smartmove.smartmove.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;
    private final VehicleRepository vehicleRepository;

    public MaintenanceService(
            MaintenanceRepository maintenanceRepository,
            VehicleRepository vehicleRepository) {

        this.maintenanceRepository = maintenanceRepository;
        this.vehicleRepository = vehicleRepository;
    }



    public List<Maintenance> getAllMaintenance() {

        return maintenanceRepository.findAll();
    }



    public Maintenance getMaintenanceById(Long id) {

        return maintenanceRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Maintenance record not found with ID: "
                                        + id
                        )
                );
    }



    public Maintenance createMaintenance(
            Long vehicleId,
            Maintenance maintenanceDetails) {

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Vehicle not found with ID: "
                                        + vehicleId
                        )
                );

        maintenanceDetails.setVehicle(vehicle);

        return maintenanceRepository.save(
                maintenanceDetails
        );
    }



    public Maintenance updateMaintenance(
            Long id,
            Long vehicleId,
            Maintenance maintenanceDetails) {

        Maintenance maintenance =
                maintenanceRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Maintenance record not found "
                                                + "with ID: " + id
                                )
                        );

        Vehicle vehicle =
                vehicleRepository.findById(vehicleId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Vehicle not found with ID: "
                                                + vehicleId
                                )
                        );

        maintenance.setVehicle(vehicle);

        maintenance.setMaintenanceDate(
                maintenanceDetails.getMaintenanceDate()
        );

        maintenance.setMaintenanceType(
                maintenanceDetails.getMaintenanceType()
        );

        maintenance.setDescription(
                maintenanceDetails.getDescription()
        );

        maintenance.setCost(
                maintenanceDetails.getCost()
        );

        maintenance.setMaintenanceStatus(
                maintenanceDetails.getMaintenanceStatus()
        );

        return maintenanceRepository.save(maintenance);
    }



    public void deleteMaintenance(Long id) {

        if (!maintenanceRepository.existsById(id)) {

            throw new RuntimeException(
                    "Maintenance record not found with ID: "
                            + id
            );
        }

        maintenanceRepository.deleteById(id);
    }



    public List<Maintenance> getMaintenanceByVehicle(
            Long vehicleId) {

        return maintenanceRepository
                .findByVehicleVehicleId(vehicleId);
    }



    public List<Maintenance> getMaintenanceByStatus(
            String status) {

        return maintenanceRepository
                .findByMaintenanceStatus(status);
    }



    public List<Maintenance> getMaintenanceByType(
            String type) {

        return maintenanceRepository
                .findByMaintenanceType(type);
    }
}
