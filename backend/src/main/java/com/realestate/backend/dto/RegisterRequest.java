package com.realestate.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String phone;
    private String role; // "CLIENT" ou "PROFESSIONAL"

    // Champs optionnels pour PROFESSIONAL
    private String companyName;
    private String rcNumber;
    private String iceNumber;
}
