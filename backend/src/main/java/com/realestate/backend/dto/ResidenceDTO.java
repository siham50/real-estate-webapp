package com.realestate.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.realestate.backend.entity.enums.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

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
    private LocalDateTime updatedAt;

    @JsonProperty("isAvailable")
    private boolean isAvailable;

    @JsonProperty("isDeleted")
    private boolean isDeleted;

    private VerificationStatus verificationStatus;
    private UserSummaryDTO owner;
    private List<ResidenceImageDTO> images;
    private List<ResidenceDocumentDTO> documents;
}
