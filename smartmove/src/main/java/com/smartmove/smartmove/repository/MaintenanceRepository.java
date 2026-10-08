package com.smartmove.smartmove.repository;

import com.smartmove.smartmove.entity.Maintenance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRepository
        extends JpaRepository<Maintenance, Long> {

    List<Maintenance> findByVehicleVehicleId(Long vehicleId);

    List<Maintenance> findByMaintenanceStatus(
            String maintenanceStatus
    );

    List<Maintenance> findByMaintenanceType(
            String maintenanceType
    );
}
