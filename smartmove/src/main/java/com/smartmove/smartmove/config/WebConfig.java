package com.smartmove.smartmove.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${smartmove.upload.directory}")
    private String uploadDirectory;

    private final RoleAuthorizationInterceptor
            roleAuthorizationInterceptor;

    public WebConfig(
            RoleAuthorizationInterceptor
                    roleAuthorizationInterceptor) {

        this.roleAuthorizationInterceptor =
                roleAuthorizationInterceptor;
    }

    @Override
    public void addResourceHandlers(
            ResourceHandlerRegistry registry) {

        Path uploadPath =
                Paths.get(uploadDirectory)
                        .toAbsolutePath()
                        .normalize();

        String uploadLocation =
                uploadPath.toUri().toString();

        registry
                .addResourceHandler("/documents/**")
                .addResourceLocations(
                        uploadLocation + "/"
                );
    }

    @Override
    public void addInterceptors(
            InterceptorRegistry registry) {

        registry.addInterceptor(
                roleAuthorizationInterceptor
        ).excludePathPatterns(
                "/api/users/login",
                "/api/users/logout",
                "/api/users/current-user",
                "/documents/**",
                "/",
                "/static/index.html",
                "/css/**",
                "/js/**",
                "/images/**",
                "/favicon.ico"
        );
    }
}