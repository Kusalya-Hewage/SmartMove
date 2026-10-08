package com.smartmove.smartmove.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class RoleAuthorizationInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler) throws Exception {

        // Allow OPTIONS requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        // For now, allow the request to continue
        return true;
    }
}
