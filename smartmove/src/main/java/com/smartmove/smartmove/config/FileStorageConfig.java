package com.smartmove.smartmove.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class FileStorageConfig implements WebMvcConfigurer {

    @Value("${smartmove.upload.directory:uploads}")
    private String uploadDirectory;


    @Override
    public void addResourceHandlers(
            ResourceHandlerRegistry registry) {

        String uploadLocation =
                Paths
                        .get(uploadDirectory)
                        .toAbsolutePath()
                        .normalize()
                        .toUri()
                        .toString();


        registry
                .addResourceHandler("/uploads/**")
                .addResourceLocations(uploadLocation);
    }
}