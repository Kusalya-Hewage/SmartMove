package com.smartmove.smartmove.controller;

import com.smartmove.smartmove.document.VehicleDocument;
import com.smartmove.smartmove.mongoservice.VehicleDocumentService;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mongo/vehicle-documents")
@CrossOrigin
public class VehicleDocumentController {

    private final VehicleDocumentService vehicleDocumentService;


    public VehicleDocumentController(
            VehicleDocumentService vehicleDocumentService) {

        this.vehicleDocumentService =
                vehicleDocumentService;
    }



    @GetMapping
    public ResponseEntity<List<VehicleDocument>>
    getAllDocuments() {

        return ResponseEntity.ok(
                vehicleDocumentService
                        .getAllDocuments()
        );
    }



    @GetMapping("/{id}")
    public ResponseEntity<?> getDocumentById(
            @PathVariable String id) {

        try {

            return ResponseEntity.ok(
                    vehicleDocumentService
                            .getDocumentById(id)
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(404)
                    .body(
                            Map.of(
                                    "success", false,
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }



    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<?> getByVehicle(
            @PathVariable Long vehicleId) {

        try {

            return ResponseEntity.ok(
                    vehicleDocumentService
                            .getDocumentsByVehicleId(
                                    vehicleId
                            )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "success", false,
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }



    @PostMapping(
            value = "/upload",
            consumes =
                    MediaType.MULTIPART_FORM_DATA_VALUE,
            produces =
                    MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<?> uploadDocument(

            @RequestParam("vehicleId")
            Long vehicleId,

            @RequestParam("documentType")
            String documentType,

            @RequestParam(
                    value = "description",
                    required = false
            )
            String description,

            @RequestParam("file")
            MultipartFile file
    ) {

        System.out.println(
                "=========================================="
        );

        System.out.println(
                "DOCUMENT UPLOAD REQUEST"
        );

        System.out.println(
                "Vehicle ID    : " + vehicleId
        );

        System.out.println(
                "Document Type : " + documentType
        );

        System.out.println(
                "Description   : " + description
        );


        if (file != null) {

            System.out.println(
                    "File Name     : "
                            + file.getOriginalFilename()
            );

            System.out.println(
                    "File Size     : "
                            + file.getSize()
            );

            System.out.println(
                    "Content Type  : "
                            + file.getContentType()
            );
        }


        System.out.println(
                "=========================================="
        );


        try {



            if (vehicleId == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "success", false,
                                        "message",
                                        "Vehicle ID is required."
                                )
                        );
            }


            if (documentType == null ||
                    documentType.isBlank()) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "success", false,
                                        "message",
                                        "Document type is required."
                                )
                        );
            }


            if (file == null || file.isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "success", false,
                                        "message",
                                        "Please select a file."
                                )
                        );
            }


            VehicleDocument savedDocument =
                    vehicleDocumentService.uploadDocument(
                            vehicleId,
                            documentType,
                            description,
                            file
                    );



            return ResponseEntity.ok(
                    Map.of(
                            "success", true,
                            "message",
                            "Document uploaded successfully.",
                            "id",
                            savedDocument.getId(),
                            "vehicleId",
                            savedDocument.getVehicleId(),
                            "registrationNo",
                            savedDocument.getRegistrationNo(),
                            "documentType",
                            savedDocument.getDocumentType(),
                            "fileName",
                            savedDocument.getFileName(),
                            "filePath",
                            savedDocument.getFilePath()
                    )
            );


        } catch (Exception e) {

            // Print actual error in IntelliJ
            e.printStackTrace();


            String errorMessage =
                    e.getMessage();


            if (errorMessage == null ||
                    errorMessage.isBlank()) {

                errorMessage =
                        "Unknown server error.";
            }


            return ResponseEntity
                    .status(500)
                    .body(
                            Map.of(
                                    "success", false,
                                    "message",
                                    errorMessage
                            )
                    );
        }
    }


    @PutMapping("/{id}")
    public ResponseEntity<?> updateDocument(
            @PathVariable String id,
            @RequestBody VehicleDocument updatedDocument) {

        try {

            VehicleDocument updated =
                    vehicleDocumentService
                            .updateDocument(
                                    id,
                                    updatedDocument
                            );

            return ResponseEntity.ok(updated);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "success", false,
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(
            @PathVariable String id) {

        try {

            vehicleDocumentService
                    .deleteDocument(id);

            return ResponseEntity.ok(
                    Map.of(
                            "success", true,
                            "message",
                            "Document deleted successfully."
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "success", false,
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }
}