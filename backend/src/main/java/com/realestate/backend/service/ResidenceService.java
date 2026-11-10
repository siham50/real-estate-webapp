package com.realestate.backend.service;

import com.realestate.backend.dto.ResidenceDTO;
import com.realestate.backend.dto.mapper.DtoMapper;
import com.realestate.backend.entity.AgencyProfile;
import com.realestate.backend.entity.Residence;
import com.realestate.backend.entity.User;
import com.realestate.backend.entity.enums.Role;
import com.realestate.backend.repository.AgencyProfileRepository;
import com.realestate.backend.repository.ResidenceRepository;
import com.realestate.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResidenceService {

    private final ResidenceRepository residenceRepository;
    private final UserRepository userRepository;
    private final AgencyProfileRepository agencyProfileRepository;

    public List<ResidenceDTO> getAllResidences() {
        return residenceRepository.findByIsAvailableTrueAndIsDeletedFalse()
                .stream()
                .map(DtoMapper::toResidenceDTO)
                .toList();
    }

    public ResidenceDTO getResidenceById(Long id) {
        Residence residence = findResidenceById(id);
        return DtoMapper.toResidenceDTO(residence);
    }

    public Residence findResidenceById(Long id) {
        return residenceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Residence not found"));
    }

    public ResidenceDTO createResidence(Residence residence) {
        if (residence.getOwner() != null && residence.getOwner().getId() != null) {
            User owner = userRepository.findById(residence.getOwner().getId())
                    .orElseThrow(() -> new RuntimeException("Owner not found"));
            residence.setOwner(owner);
        }

        if (residence.getOwner() != null) {
            User owner = residence.getOwner();
            if (owner.getRole() == Role.PROFESSIONAL) {
                AgencyProfile agencyProfile = agencyProfileRepository.findByUserId(owner.getId())
                        .orElseThrow(() -> new RuntimeException("Votre compte agence doit être vérifié par un administrateur avant de publier une résidence."));
                if (!agencyProfile.isVerified()) {
                    throw new RuntimeException("Votre compte agence doit être vérifié par un administrateur avant de publier une résidence.");
                }
            }
        }

        Residence savedResidence = residenceRepository.save(residence);
        return DtoMapper.toResidenceDTO(savedResidence);
    }

    public ResidenceDTO updateResidence(Long id, Residence updatedResidence) {
        Residence existingResidence = findResidenceById(id);

        if (updatedResidence.getName() != null) {
            existingResidence.setName(updatedResidence.getName());
        }
        if (updatedResidence.getDescription() != null) {
            existingResidence.setDescription(updatedResidence.getDescription());
        }
        if (updatedResidence.getAddress() != null) {
            existingResidence.setAddress(updatedResidence.getAddress());
        }
        if (updatedResidence.getCity() != null) {
            existingResidence.setCity(updatedResidence.getCity());
        }
        if (updatedResidence.getLatitude() != null) {
            existingResidence.setLatitude(updatedResidence.getLatitude());
        }
        if (updatedResidence.getLongitude() != null) {
            existingResidence.setLongitude(updatedResidence.getLongitude());
        }
        if (updatedResidence.getVerificationStatus() != null) {
            existingResidence.setVerificationStatus(updatedResidence.getVerificationStatus());
        }
        if (updatedResidence.getOwner() != null && updatedResidence.getOwner().getId() != null) {
            User owner = userRepository.findById(updatedResidence.getOwner().getId())
                    .orElseThrow(() -> new RuntimeException("Owner not found"));
            existingResidence.setOwner(owner);
        }

        Residence savedResidence = residenceRepository.save(existingResidence);
        return DtoMapper.toResidenceDTO(savedResidence);
    }

    public void deleteResidence(Long id) {
        Residence residence = residenceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Residence not found"));
        residence.setDeleted(true);
        residenceRepository.save(residence);
    }

    public ResidenceDTO toggleAvailability(Long id) {
        Residence residence = residenceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Residence not found"));
        residence.setAvailable(!residence.isAvailable());
        Residence updated = residenceRepository.save(residence);
        return DtoMapper.toResidenceDTO(updated);
    }
}
