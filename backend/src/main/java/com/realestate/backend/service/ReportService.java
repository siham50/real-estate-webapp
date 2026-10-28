package com.realestate.backend.service;

import com.realestate.backend.dto.ReportDTO;
import com.realestate.backend.dto.mapper.DtoMapper;
import com.realestate.backend.entity.Report;
import com.realestate.backend.entity.User;
import com.realestate.backend.entity.enums.ReportStatus;
import com.realestate.backend.repository.ReportRepository;
import com.realestate.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;

    public ReportDTO createReport(Report report) {
        Long reporterId = report.getResolvedReporterId();
        Long reportedUserId = report.getResolvedReportedUserId();

        if (reporterId == null || reportedUserId == null) {
            throw new IllegalArgumentException("Les identifiants de l'auteur (reporter) et de l'utilisateur signalé (reportedUser) sont requis");
        }

        // Règle métier : Pas d'auto-signalement (reporterId != reportedUserId)
        if (Objects.equals(reporterId, reportedUserId)) {
            throw new IllegalArgumentException("Un utilisateur ne peut pas se signaler lui-même");
        }

        if (report.getReason() == null || report.getReason().trim().isEmpty()) {
            throw new IllegalArgumentException("Le motif du signalement est obligatoire");
        }

        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new RuntimeException("Utilisateur déclarant introuvable avec l'id : " + reporterId));

        User reportedUser = userRepository.findById(reportedUserId)
                .orElseThrow(() -> new RuntimeException("Utilisateur signalé introuvable avec l'id : " + reportedUserId));

        report.setReporter(reporter);
        report.setReportedUser(reportedUser);
        report.setStatus(ReportStatus.PENDING);

        Report savedReport = reportRepository.save(report);
        return DtoMapper.toReportDTO(savedReport);
    }

    public List<ReportDTO> getAllReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(DtoMapper::toReportDTO)
                .toList();
    }
}
