package com.smartmove.smartmove.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

@Component
public class MongoTest implements CommandLineRunner {

    private final MongoTemplate mongoTemplate;

    public MongoTest(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public void run(String... args) {

        System.out.println("=================================");
        System.out.println("MongoDB DATABASE: "
                + mongoTemplate.getDb().getName());

        System.out.println("Passenger reviews count: "
                + mongoTemplate.getCollection("passenger_reviews")
                .countDocuments());

        System.out.println("=================================");
    }
}