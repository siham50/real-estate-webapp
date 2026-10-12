package com.realestate.backend.dto;

import com.realestate.backend.entity.enums.PropertyPurpose;
import com.realestate.backend.entity.enums.PropertyType;
import com.realestate.backend.entity.enums.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyDTO {
    private Long id;
    private String title;
    private String description;
    private PropertyType type;
    private PropertyPurpose purpose;
    private BigDecimal price;
    private Double surfaceArea;
    private String address;
    private String city;
    private Double latitude;
    private Double longitude;
    private VerificationStatus verificationStatus;
    private boolean isDeleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UserSummaryDTO owner;
    private ResidenceSummaryDTO residence;
}
