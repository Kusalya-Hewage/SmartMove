package com.smartmove.smartmove.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

    private String username;

    private String email;

    private String password;

    private String role;

    private String fullName;

    private String phone;

    private String address;
}
