package com.realestate.backend.service;

import com.realestate.backend.dto.ReportDTO;
import com.realestate.backend.dto.mapper.DtoMapper;
import com.realestate.backend.entity.Report;
import com.realestate.backend.entity.User;
import com.realestate.backend.entity.enums.ReportStatus;
import com.realestate.backend.entity.enums.Role;
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
    private final NotificationService notificationService;

    public ReportDTO createReport(ReportDTO dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Les informations de signalement sont requises");
        }
        Long reporterId = dto.getResolvedReporterId();
        Long reportedUserId = dto.getResolvedReportedUserId();
        return processReport(reporterId, reportedUserId, dto.getReason());
    }

    public ReportDTO createReport(Report report) {
        if (report == null) {
            throw new IllegalArgumentException("Les informations de signalement sont requises");
        }
        Long reporterId = report.getResolvedReporterId();
        Long reportedUserId = report.getResolvedReportedUserId();
        return processReport(reporterId, reportedUserId, report.getReason());
    }

    private ReportDTO processReport(Long reporterId, Long reportedUserId, String reason) {
        if (reporterId == null || reportedUserId == null) {
            throw new IllegalArgumentException("Les identifiants de l'auteur (reporter) et de l'utilisateur signalé (reportedUser) sont requis");
        }

        // Règle métier : Pas d'auto-signalement (reporterId != reportedUserId)
        if (Objects.equals(reporterId, reportedUserId)) {
            throw new IllegalArgumentException("Un utilisateur ne peut pas se signaler lui-même");
        }

        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("Le motif du signalement est obligatoire");
        }

        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new RuntimeException("Utilisateur déclarant introuvable avec l'id : " + reporterId));

        User reportedUser = userRepository.findById(reportedUserId)
                .orElseThrow(() -> new RuntimeException("Utilisateur signalé introuvable avec l'id : " + reportedUserId));

        Report report = Report.builder()
                .reporter(reporter)
                .reportedUser(reportedUser)
                .reason(reason.trim())
                .status(ReportStatus.PENDING)
                .build();

        Report savedReport = reportRepository.save(report);

        // Envoi d'une notification aux Administrateurs
        try {
            List<User> admins = userRepository.findByRole(Role.ADMIN);
            if (admins != null) {
                for (User admin : admins) {
                    notificationService.createNotification(
                            admin.getId(),
                            "Nouveau signalement reçu concernant l'utilisateur " + reportedUser.getEmail() + " : " + reason.trim(),
                            "REPORT"
                    );
                }
            }
        } catch (Exception ignored) {
        }

        return DtoMapper.toReportDTO(savedReport);
    }

    public List<ReportDTO> getAllReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(DtoMapper::toReportDTO)
                .toList();
    }

    public ReportDTO updateReportStatus(Long id, ReportStatus status) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Signalement introuvable avec l'id : " + id));
        report.setStatus(status);
        Report savedReport = reportRepository.save(report);
        return DtoMapper.toReportDTO(savedReport);
    }
}
