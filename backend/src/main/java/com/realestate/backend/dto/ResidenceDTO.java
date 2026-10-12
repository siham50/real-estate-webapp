package com.realestate.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResidenceDTO {
    private Long id;
    private String name;
    private String description;
    private String address;
    private String city;
    private Double latitude;
    private Double longitude;
    private LocalDateTime createdAt;

    @JsonProperty("isAvailable")
    private boolean isAvailable;

    @JsonProperty("isDeleted")
    private boolean isDeleted;

    private UserSummaryDTO owner;
}
