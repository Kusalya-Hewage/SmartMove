package com.smartmove.smartmove.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponse {

    private boolean success;
    private String message;
    private Long userId;
    private String username;
    private String role;
}
