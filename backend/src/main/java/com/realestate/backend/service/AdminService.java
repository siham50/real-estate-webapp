package com.realestate.backend.service;

import com.realestate.backend.dto.AdminStatsDTO;
import com.realestate.backend.dto.UserDTO;
import com.realestate.backend.dto.mapper.DtoMapper;
import com.realestate.backend.entity.User;
import com.realestate.backend.entity.enums.ReportStatus;
import com.realestate.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final BookingRepository bookingRepository;
    private final ReportRepository reportRepository;
    private final AgencyProfileRepository agencyProfileRepository;

    public AdminStatsDTO getAdminStats() {
        long totalUsers = userRepository.count();
        long totalProperties = propertyRepository.count();
        long totalBookings = bookingRepository.count();
        long pendingReports = reportRepository.countByStatus(ReportStatus.PENDING);

        return DtoMapper.toAdminStatsDTO(totalUsers, totalProperties, totalBookings, pendingReports);
    }

    public UserDTO updateUserStatus(Long id, boolean isActive) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable avec l'id : " + id));

        user.setActive(isActive);
        User updated = userRepository.save(user);
        return DtoMapper.toUserDTO(updated);
    }

    @Transactional
    public UserDTO verifyUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable avec l'id : " + userId));

        user.setIsIdentityVerified(true);
        User savedUser = userRepository.save(user);

        // Si l'utilisateur a un profil agence, approuver également ses documents
        agencyProfileRepository.findByUserId(userId).ifPresent(profile -> {
            profile.setVerified(true);
            agencyProfileRepository.save(profile);
        });

        return DtoMapper.toUserDTO(savedUser);
    }
}
