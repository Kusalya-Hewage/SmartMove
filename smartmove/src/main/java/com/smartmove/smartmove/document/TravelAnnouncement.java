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
@Document(collection = "travel_announcements")
public class TravelAnnouncement {

    @Id
    private String id;

    private String title;

    private String message;

    private String announcementType;

    private Long routeId;

    private Long tripId;

    private LocalDateTime publishDate;

    private LocalDateTime expiryDate;

    private String priority;

    private String status;
}