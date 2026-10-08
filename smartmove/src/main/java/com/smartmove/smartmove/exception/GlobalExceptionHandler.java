package com.smartmove.smartmove.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // ==========================================
    // RUNTIME EXCEPTIONS
    // ==========================================

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(
            RuntimeException exception) {

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("timestamp", LocalDateTime.now());
        response.put("status", HttpStatus.BAD_REQUEST.value());
        response.put("error", "Bad Request");
        response.put("message", exception.getMessage());

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }

    // ==========================================
    // DATABASE CONSTRAINT ERRORS
    // ==========================================

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>>
    handleDataIntegrityViolation(
            DataIntegrityViolationException exception) {

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("timestamp", LocalDateTime.now());
        response.put(
                "status",
                HttpStatus.CONFLICT.value()
        );
        response.put("error", "Database Constraint Error");
        response.put(
                "message",
                "The operation violates a database constraint."
        );

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(response);
    }

    // ==========================================
    // GENERAL EXCEPTION
    // ==========================================

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleException(
            Exception exception) {

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("timestamp", LocalDateTime.now());
        response.put(
                "status",
                HttpStatus.INTERNAL_SERVER_ERROR.value()
        );
        response.put(
                "error",
                "Internal Server Error"
        );
        response.put(
                "message",
                "An unexpected error occurred."
        );

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(response);
    }
}
