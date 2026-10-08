package com.smartmove.smartmove.mongorepository;

import com.smartmove.smartmove.document.TravelAnnouncement;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface TravelAnnouncementRepository
        extends MongoRepository<TravelAnnouncement, String> {

    List<TravelAnnouncement> findByStatus(String status);

    List<TravelAnnouncement> findByAnnouncementType(String announcementType);

    List<TravelAnnouncement> findByRouteId(Long routeId);

    List<TravelAnnouncement> findByPriority(String priority);

    @Query("""
{
    'status': 'ACTIVE',
    '$or': [
        { 'expiryDate': null },
        { 'expiryDate': { '$gte': ?0 } }
    ]
}
""")
    List<TravelAnnouncement> findCurrentlyActive(
            java.time.LocalDateTime currentDateTime);
}
