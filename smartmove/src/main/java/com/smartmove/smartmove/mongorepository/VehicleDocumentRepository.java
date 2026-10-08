package com.smartmove.smartmove.mongorepository;

import com.smartmove.smartmove.document.VehicleDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface VehicleDocumentRepository
        extends MongoRepository<VehicleDocument, String> {

    List<VehicleDocument> findByVehicleId(Long vehicleId);

    List<VehicleDocument> findByRegistrationNoIgnoreCase(
            String registrationNo
    );

    List<VehicleDocument> findByDocumentTypeIgnoreCase(
            String documentType
    );

    List<VehicleDocument> findByStatusIgnoreCase(
            String status
    );
}