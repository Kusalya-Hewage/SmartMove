// 1. Switch to (or create) the smartmove database
use smartmove

// 2. Drop collections if any remnants exist
db.passenger_reviews.drop();
db.travel_announcements.drop();
db.vehicle_documents.drop();

// 3. Create 'passenger_reviews' collection with sample data
db.passenger_reviews.insertMany([
  {
    "_class": "com.smartmove.smartmove.document.PassengerReview",
    "passengerId": NumberLong(1),
    "tripId": NumberLong(10),
    "routeId": NumberLong(5),
    "rating": NumberInt(5),
    "comment": "The journey was comfortable and the driver was very punctual.",
    "reviewDate": new Date(),
    "status": "VISIBLE"
  },
  {
    "_class": "com.smartmove.smartmove.document.PassengerReview",
    "passengerId": NumberLong(2),
    "tripId": NumberLong(10),
    "routeId": NumberLong(5),
    "rating": NumberInt(4),
    "comment": "Good experience overall.",
    "reviewDate": new Date(),
    "status": "VISIBLE"
  }
]);

// 4. Create 'travel_announcements' collection with sample data
db.travel_announcements.insertMany([
  {
    "_class": "com.smartmove.smartmove.document.TravelAnnouncement",
    "title": "Route Maintenance Notice",
    "message": "Route 5 will experience minor delays due to road maintenance.",
    "announcementType": "DELAY",
    "routeId": NumberLong(5),
    "tripId": NumberLong(10),
    "publishDate": new Date(),
    "expiryDate": new Date(Date.now() + 864000000), // +10 days
    "priority": "HIGH",
    "status": "ACTIVE"
  },
  {
    "_class": "com.smartmove.smartmove.document.TravelAnnouncement",
    "title": "Holiday Schedule Update",
    "message": "Special bus schedules are active for the upcoming holiday.",
    "announcementType": "GENERAL",
    "routeId": NumberLong(12),
    "tripId": NumberLong(20),
    "publishDate": new Date(),
    "expiryDate": new Date(Date.now() + 864000000),
    "priority": "NORMAL",
    "status": "ACTIVE"
  }
]);

// 5. Create 'vehicle_documents' collection with sample data
db.vehicle_documents.insertMany([
  {
    "_class": "com.smartmove.smartmove.document.VehicleDocument",
    "vehicleId": NumberLong(101),
    "registrationNo": "NB-1234",
    "documentType": "INSURANCE",
    "fileName": "NB-1234-insurance.pdf",
    "fileType": "application/pdf",
    "fileUrl": "/uploads/vehicles/NB-1234-insurance.pdf",
    "description": "Vehicle insurance policy document",
    "uploadedDate": new Date(),
    "status": "ACTIVE"
  },
  {
    "_class": "com.smartmove.smartmove.document.VehicleDocument",
    "vehicleId": NumberLong(102),
    "registrationNo": "WP-5678",
    "documentType": "REVENUE_LICENSE",
    "fileName": "WP-5678-license.pdf",
    "fileType": "application/pdf",
    "fileUrl": "/uploads/vehicles/WP-5678-license.pdf",
    "description": "Annual revenue license",
    "uploadedDate": new Date(),
    "status": "ACTIVE"
  }
]);

db.passenger_reviews.find().pretty()

use smartmove

db.passenger_reviews.countDocuments()

db.passenger_reviews.find()

show collections
