package com.realestate.backend.dto;

import com.realestate.backend.entity.enums.ReportStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportDTO {
    private Long id;
    private UserSummaryDTO reporter;
    private UserSummaryDTO reportedUser;
    private String reason;
    private ReportStatus status;
    private LocalDateTime createdAt;
}
