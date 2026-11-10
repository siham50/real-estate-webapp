package com.realestate.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileDTO {

    private String firstName;
    private String lastName;
    private String phone;

    // Champs optionnels pour les professionnels / agences
    private String companyName;
    private String rcNumber;
    private String iceNumber;
}

