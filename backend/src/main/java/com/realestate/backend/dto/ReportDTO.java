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
    private Long reporterId;
    private Long reportedUserId;
    private UserSummaryDTO reporter;
    private UserSummaryDTO reportedUser;
    private String reason;
    private ReportStatus status;
    private LocalDateTime createdAt;

    public Long getResolvedReporterId() {
        if (reporterId != null) {
            return reporterId;
        }
        if (reporter != null && reporter.getId() != null) {
            return reporter.getId();
        }
        return null;
    }

    public Long getResolvedReportedUserId() {
        if (reportedUserId != null) {
            return reportedUserId;
        }
        if (reportedUser != null && reportedUser.getId() != null) {
            return reportedUser.getId();
        }
        return null;
    }
}
