package com.smartmove.smartmove.document;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Document(collection = "vehicle_documents")
public class VehicleDocument {

    @Id
    private String id;

    private Long vehicleId;

    private String registrationNo;

    private String documentType;

    private String fileName;

    private String filePath;

    private String description;

    private String status;

    private LocalDateTime uploadedDate;
}