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
public class NotificationDTO {
    private Long id;
    private UserSummaryDTO user;
    private String message;
    private String type;

    @JsonProperty("isRead")
    private boolean isRead;

    private LocalDateTime createdAt;
}
