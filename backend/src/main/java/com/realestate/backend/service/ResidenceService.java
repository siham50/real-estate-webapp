package com.realestate.backend.service;

import com.realestate.backend.dto.ResidenceDTO;
import com.realestate.backend.dto.mapper.DtoMapper;
import com.realestate.backend.entity.AgencyProfile;
import com.realestate.backend.entity.Residence;
import com.realestate.backend.entity.ResidenceImage;
import com.realestate.backend.entity.User;
import com.realestate.backend.entity.enums.Role;
import com.realestate.backend.entity.enums.VerificationStatus;
import com.realestate.backend.repository.AgencyProfileRepository;
import com.realestate.backend.repository.ResidenceRepository;
import com.realestate.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResidenceService {

    private final ResidenceRepository residenceRepository;
    private final UserRepository userRepository;
    private final AgencyProfileRepository agencyProfileRepository;

    public List<ResidenceDTO> getAllResidences() {
        return residenceRepository.findByVerificationStatusAndIsDeletedFalse(VerificationStatus.VERIFIED).stream()
                .filter(r -> !r.isDeleted() && r.isAvailable() && r.getVerificationStatus() == VerificationStatus.VERIFIED)
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
                residence.setVerificationStatus(VerificationStatus.VERIFIED);
                residence.setAvailable(true);
            } else if (owner.getRole() == Role.CLIENT) {
                if (!Boolean.TRUE.equals(owner.getIsIdentityVerified())) {
                    throw new RuntimeException("Vous devez faire vérifier votre CIN avant de publier.");
                }
                residence.setVerificationStatus(VerificationStatus.PENDING);
                residence.setAvailable(false);
            }
        }

        if (residence.getVerificationStatus() == null) {
            residence.setVerificationStatus(VerificationStatus.PENDING);
        }

        if (residence.getDocuments() != null) {
            for (com.realestate.backend.entity.ResidenceDocument doc : residence.getDocuments()) {
                doc.setResidence(residence);
            }
        }

        if (residence.getDocumentUrl() != null && !residence.getDocumentUrl().isBlank()) {
            if (residence.getDocuments() == null) {
                residence.setDocuments(new ArrayList<>());
            }
            boolean exists = residence.getDocuments().stream()
                    .anyMatch(d -> residence.getDocumentUrl().equals(d.getDocumentUrl()));
            if (!exists) {
                com.realestate.backend.entity.ResidenceDocument doc = com.realestate.backend.entity.ResidenceDocument.builder()
                        .residence(residence)
                        .documentUrl(residence.getDocumentUrl())
                        .build();
                residence.getDocuments().add(doc);
            }
        }

        if (residence.getOwner() != null && residence.getOwner().getRole() == Role.CLIENT) {
            if (residence.getDocuments() == null || residence.getDocuments().isEmpty()) {
                throw new RuntimeException("Vous devez fournir au moins un document justificatif de propriété.");
            }
        }

        if (residence.getImages() != null && !residence.getImages().isEmpty()) {
            boolean hasPrimary = residence.getImages().stream().anyMatch(ResidenceImage::isPrimary);
            if (!hasPrimary) {
                residence.getImages().get(0).setPrimary(true);
            }
            for (ResidenceImage img : residence.getImages()) {
                img.setResidence(residence);
            }
        } else {
            residence.setImages(new ArrayList<>());
        }

        if (residence.getViews() == null) {
            residence.setViews(0);
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
        if (updatedResidence.getImages() != null) {
            existingResidence.getImages().clear();
            boolean hasPrimary = updatedResidence.getImages().stream().anyMatch(ResidenceImage::isPrimary);
            if (!hasPrimary && !updatedResidence.getImages().isEmpty()) {
                updatedResidence.getImages().get(0).setPrimary(true);
            }
            for (ResidenceImage img : updatedResidence.getImages()) {
                img.setResidence(existingResidence);
                existingResidence.getImages().add(img);
            }
        }

        Residence savedResidence = residenceRepository.save(existingResidence);
        return DtoMapper.toResidenceDTO(savedResidence);
    }

    public List<ResidenceDTO> getResidencesByOwnerId(Long ownerId) {
        return residenceRepository.findByOwnerIdAndIsDeletedFalse(ownerId).stream()
                .map(DtoMapper::toResidenceDTO)
                .toList();
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

    public ResidenceDTO incrementViews(Long id) {
        Residence residence = residenceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Residence not found"));
        residence.setViews((residence.getViews() != null ? residence.getViews() : 0) + 1);
        Residence saved = residenceRepository.save(residence);
        return DtoMapper.toResidenceDTO(saved);
    }
}
