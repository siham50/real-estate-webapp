package com.realestate.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDTO {
    private Long id;
    private Long bookingId;
    private Long propertyId;
    private String propertyTitle;
    private String propertyCity;
    private String propertyImageUrl;
    private UserSummaryDTO client;
    private String clientFirstName;
    private String clientLastName;
    private UserSummaryDTO targetUser;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
