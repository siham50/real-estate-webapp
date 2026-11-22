package com.realestate.backend.service;

import com.realestate.backend.dto.AdminStatsDTO;
import com.realestate.backend.dto.PropertyDTO;
import com.realestate.backend.dto.ResidenceDTO;
import com.realestate.backend.dto.UserDTO;
import com.realestate.backend.dto.mapper.DtoMapper;
import com.realestate.backend.entity.Property;
import com.realestate.backend.entity.Residence;
import com.realestate.backend.entity.User;
import com.realestate.backend.entity.enums.ReportStatus;
import com.realestate.backend.entity.enums.VerificationStatus;
import com.realestate.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final ResidenceRepository residenceRepository;
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
        return mapUserWithAgencyProfile(updated);
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

        return mapUserWithAgencyProfile(savedUser);
    }

    public Map<String, Object> getPendingListings() {
        List<PropertyDTO> properties = propertyRepository.findByVerificationStatusAndIsDeletedFalse(VerificationStatus.PENDING)
                .stream()
                .map(DtoMapper::toPropertyDTO)
                .toList();

        List<ResidenceDTO> residences = residenceRepository.findByVerificationStatusAndIsDeletedFalse(VerificationStatus.PENDING)
                .stream()
                .map(DtoMapper::toResidenceDTO)
                .toList();

        Map<String, Object> result = new HashMap<>();
        result.put("properties", properties);
        result.put("residences", residences);
        return result;
    }

    @Transactional
    public PropertyDTO verifyProperty(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Bien introuvable avec l'id : " + propertyId));
        property.setVerificationStatus(VerificationStatus.VERIFIED);
        Property saved = propertyRepository.save(property);
        return DtoMapper.toPropertyDTO(saved);
    }

    @Transactional
    public PropertyDTO rejectProperty(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Bien introuvable avec l'id : " + propertyId));
        property.setVerificationStatus(VerificationStatus.REJECTED);
        Property saved = propertyRepository.save(property);
        return DtoMapper.toPropertyDTO(saved);
    }

    @Transactional
    public ResidenceDTO verifyResidence(Long residenceId) {
        Residence residence = residenceRepository.findById(residenceId)
                .orElseThrow(() -> new RuntimeException("Résidence introuvable avec l'id : " + residenceId));
        residence.setVerificationStatus(VerificationStatus.VERIFIED);
        Residence saved = residenceRepository.save(residence);
        return DtoMapper.toResidenceDTO(saved);
    }

    @Transactional
    public ResidenceDTO rejectResidence(Long residenceId) {
        Residence residence = residenceRepository.findById(residenceId)
                .orElseThrow(() -> new RuntimeException("Résidence introuvable avec l'id : " + residenceId));
        residence.setVerificationStatus(VerificationStatus.REJECTED);
        Residence saved = residenceRepository.save(residence);
        return DtoMapper.toResidenceDTO(saved);
    }

    private UserDTO mapUserWithAgencyProfile(User user) {
        if (user == null) {
            return null;
        }
        UserDTO dto = DtoMapper.toUserDTO(user);
        agencyProfileRepository.findByUserId(user.getId()).ifPresent(profile -> {
            dto.setCompanyName(profile.getCompanyName());
            dto.setRcNumber(profile.getRcNumber());
            dto.setIceNumber(profile.getIceNumber());
            dto.setAgencyDocumentUrl(profile.getDocumentUrl());
        });
        return dto;
    }
}
