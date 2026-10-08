package com.smartmove.smartmove.controller;

import com.smartmove.smartmove.entity.Maintenance;
import com.smartmove.smartmove.service.MaintenanceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
@CrossOrigin(origins = "*")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    public MaintenanceController(
            MaintenanceService maintenanceService) {

        this.maintenanceService = maintenanceService;
    }


    @GetMapping
    public ResponseEntity<List<Maintenance>>
    getAllMaintenance() {

        return ResponseEntity.ok(
                maintenanceService.getAllMaintenance()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Maintenance>
    getMaintenanceById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                maintenanceService.getMaintenanceById(id)
        );
    }


    @PostMapping
    public ResponseEntity<Maintenance>
    createMaintenance(
            @RequestParam Long vehicleId,
            @RequestBody Maintenance maintenance) {

        Maintenance savedMaintenance =
                maintenanceService.createMaintenance(
                        vehicleId,
                        maintenance
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedMaintenance);
    }


    @PutMapping("/{id}")
    public ResponseEntity<Maintenance>
    updateMaintenance(
            @PathVariable Long id,
            @RequestParam Long vehicleId,
            @RequestBody Maintenance maintenance) {

        Maintenance updatedMaintenance =
                maintenanceService.updateMaintenance(
                        id,
                        vehicleId,
                        maintenance
                );

        return ResponseEntity.ok(
                updatedMaintenance
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String>
    deleteMaintenance(
            @PathVariable Long id) {

        maintenanceService.deleteMaintenance(id);

        return ResponseEntity.ok(
                "Maintenance record deleted successfully"
        );
    }



    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<Maintenance>>
    getMaintenanceByVehicle(
            @PathVariable Long vehicleId) {

        return ResponseEntity.ok(
                maintenanceService.getMaintenanceByVehicle(
                        vehicleId
                )
        );
    }


    @GetMapping("/status/{status}")
    public ResponseEntity<List<Maintenance>>
    getMaintenanceByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(
                maintenanceService.getMaintenanceByStatus(
                        status
                )
        );
    }


    @GetMapping("/type/{type}")
    public ResponseEntity<List<Maintenance>>
    getMaintenanceByType(
            @PathVariable String type) {

        return ResponseEntity.ok(
                maintenanceService.getMaintenanceByType(
                        type
                )
        );
    }
}
