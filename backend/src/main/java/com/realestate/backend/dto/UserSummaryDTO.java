package com.realestate.backend.dto;

import com.realestate.backend.entity.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private Role role;
}
