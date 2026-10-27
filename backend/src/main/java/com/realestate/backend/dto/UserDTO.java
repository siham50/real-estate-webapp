package com.realestate.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.realestate.backend.entity.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private Role role;

    @JsonProperty("isIdentityVerified")
    private Boolean isIdentityVerified;

    private String identityDocumentUrl;

    @JsonProperty("isActive")
    private boolean isActive;

    private LocalDateTime createdAt;
}
