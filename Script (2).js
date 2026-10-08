db.getCollection("vehicle_documents").find({})

db.vehicle_documents.createIndex({
    vehicleId: 1
})

db.vehicle_documents.createIndex({
    registrationNo: 1
})