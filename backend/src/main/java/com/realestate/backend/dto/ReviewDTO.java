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
    private UserSummaryDTO client;
    private UserSummaryDTO targetUser;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
