package com.smartmove.smartmove.mongoservice;

import com.smartmove.smartmove.document.VehicleDocument;
import com.smartmove.smartmove.entity.Vehicle;
import com.smartmove.smartmove.mongorepository.VehicleDocumentRepository;
import com.smartmove.smartmove.repository.VehicleRepository;
import com.smartmove.smartmove.service.FileStorageService;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class VehicleDocumentService {

    private final VehicleDocumentRepository documentRepository;

    private final VehicleRepository vehicleRepository;

    private final FileStorageService fileStorageService;


    public VehicleDocumentService(
            VehicleDocumentRepository documentRepository,
            VehicleRepository vehicleRepository,
            FileStorageService fileStorageService
    ) {

        this.documentRepository =
                documentRepository;

        this.vehicleRepository =
                vehicleRepository;

        this.fileStorageService =
                fileStorageService;
    }



    public List<VehicleDocument> getAllDocuments() {

        return documentRepository.findAll();
    }



    public VehicleDocument getDocumentById(
            String id) {

        return documentRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Vehicle document not found with ID: "
                                        + id
                        )
                );
    }



    public List<VehicleDocument>
    getDocumentsByVehicleId(
            Long vehicleId) {

        validateVehicle(vehicleId);

        return documentRepository
                .findByVehicleId(vehicleId);
    }



    public List<VehicleDocument>
    getDocumentsByRegistration(
            String registrationNo) {

        if (registrationNo == null ||
                registrationNo.isBlank()) {

            throw new RuntimeException(
                    "Registration number is required."
            );
        }

        return documentRepository
                .findByRegistrationNoIgnoreCase(
                        registrationNo.trim()
                );
    }



    public List<VehicleDocument>
    getDocumentsByType(
            String documentType) {

        if (documentType == null ||
                documentType.isBlank()) {

            throw new RuntimeException(
                    "Document type is required."
            );
        }

        return documentRepository
                .findByDocumentTypeIgnoreCase(
                        documentType.trim()
                );
    }



    public List<VehicleDocument>
    getDocumentsByStatus(
            String status) {

        if (status == null ||
                status.isBlank()) {

            throw new RuntimeException(
                    "Status is required."
            );
        }

        return documentRepository
                .findByStatusIgnoreCase(
                        status.trim()
                );
    }



    public VehicleDocument createDocument(
            VehicleDocument document) {

        if (document == null) {

            throw new RuntimeException(
                    "Document data is required."
            );
        }


        if (document.getVehicleId() == null) {

            throw new RuntimeException(
                    "Vehicle ID is required."
            );
        }


        Vehicle vehicle =
                validateVehicle(
                        document.getVehicleId()
                );


        if (document.getDocumentType() == null ||
                document.getDocumentType().isBlank()) {

            throw new RuntimeException(
                    "Document type is required."
            );
        }


        if (document.getFileName() == null ||
                document.getFileName().isBlank()) {

            throw new RuntimeException(
                    "File name is required."
            );
        }


        if (document.getFilePath() == null ||
                document.getFilePath().isBlank()) {

            throw new RuntimeException(
                    "File path is required."
            );
        }


        // Set registration if missing
        if (document.getRegistrationNo() == null ||
                document.getRegistrationNo().isBlank()) {

            document.setRegistrationNo(
                    vehicle.getRegistrationNo()
            );
        }


        document.setDocumentType(
                document.getDocumentType()
                        .trim()
                        .toUpperCase()
        );


        document.setUploadedDate(
                LocalDateTime.now()
        );


        if (document.getStatus() == null ||
                document.getStatus().isBlank()) {

            document.setStatus("ACTIVE");

        } else {

            document.setStatus(
                    document.getStatus()
                            .trim()
                            .toUpperCase()
            );
        }


        return documentRepository.save(
                document
        );
    }



    public VehicleDocument uploadDocument(
            Long vehicleId,
            String documentType,
            String description,
            MultipartFile file
    ) {

        // Validate vehicle first
        Vehicle vehicle =
                validateVehicle(vehicleId);


        // Validate document type
        if (documentType == null ||
                documentType.isBlank()) {

            throw new RuntimeException(
                    "Document type is required."
            );
        }


        // Validate file
        if (file == null || file.isEmpty()) {

            throw new RuntimeException(
                    "Please select a file."
            );
        }


        String filePath = null;


        try {

            filePath =
                    fileStorageService
                            .storeVehicleFile(file);



            VehicleDocument document =
                    new VehicleDocument();


            document.setVehicleId(
                    vehicle.getVehicleId()
            );


            document.setRegistrationNo(
                    vehicle.getRegistrationNo()
            );


            document.setDocumentType(
                    documentType
                            .trim()
                            .toUpperCase()
            );


            document.setFileName(
                    file.getOriginalFilename()
            );


            document.setFilePath(
                    filePath
            );


            document.setDescription(
                    description == null
                            ? ""
                            : description.trim()
            );


            document.setUploadedDate(
                    LocalDateTime.now()
            );


            document.setStatus(
                    "ACTIVE"
            );


            return documentRepository.save(
                    document
            );

        } catch (Exception e) {



            if (filePath != null) {

                try {

                    fileStorageService
                            .deleteVehicleFile(
                                    filePath
                            );

                } catch (Exception ignored) {

                    System.err.println(
                            "Could not remove uploaded file."
                    );
                }
            }


            throw new RuntimeException(
                    "Document upload failed: " +
                            (e.getMessage() == null
                                    ? "Unknown error"
                                    : e.getMessage()),
                    e
            );
        }
    }


    public VehicleDocument updateDocument(
            String id,
            VehicleDocument updatedDocument
    ) {

        VehicleDocument existing =
                getDocumentById(id);


        if (updatedDocument == null) {

            throw new RuntimeException(
                    "Updated document data is required."
            );
        }


        if (updatedDocument.getDocumentType() != null &&
                !updatedDocument
                        .getDocumentType()
                        .isBlank()) {

            existing.setDocumentType(
                    updatedDocument
                            .getDocumentType()
                            .trim()
                            .toUpperCase()
            );
        }


        if (updatedDocument.getDescription() != null) {

            existing.setDescription(
                    updatedDocument
                            .getDescription()
                            .trim()
            );
        }


        if (updatedDocument.getStatus() != null &&
                !updatedDocument
                        .getStatus()
                        .isBlank()) {

            existing.setStatus(
                    updatedDocument
                            .getStatus()
                            .trim()
                            .toUpperCase()
            );
        }


        return documentRepository.save(
                existing
        );
    }


    public void deleteDocument(
            String id) {

        VehicleDocument document =
                getDocumentById(id);


        documentRepository.deleteById(id);



        if (document.getFilePath() != null &&
                !document.getFilePath().isBlank()) {

            try {

                fileStorageService
                        .deleteVehicleFile(
                                document.getFilePath()
                        );

            } catch (Exception e) {

                System.err.println(
                        "MongoDB record deleted, but physical "
                                + "file could not be deleted: "
                                + e.getMessage()
                );
            }
        }
    }


    private Vehicle validateVehicle(
            Long vehicleId) {

        if (vehicleId == null) {

            throw new RuntimeException(
                    "Vehicle ID is required."
            );
        }


        return vehicleRepository
                .findById(vehicleId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Vehicle not found with ID: "
                                        + vehicleId
                        )
                );
    }
}