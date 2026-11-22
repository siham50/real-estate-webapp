package com.realestate.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResidenceImageDTO {
    private Long id;
    private String imageUrl;

    @JsonProperty("isPrimary")
    private boolean isPrimary;
}
