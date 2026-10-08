package com.smartmove.smartmove;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
public class SmartmoveApplication {

	public static void main(String[] args) {
		SpringApplication.run(SmartmoveApplication.class, args);
	}

}
