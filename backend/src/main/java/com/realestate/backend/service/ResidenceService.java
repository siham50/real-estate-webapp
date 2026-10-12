package com.realestate.backend.service;

import com.realestate.backend.dto.ResidenceDTO;
import com.realestate.backend.dto.mapper.DtoMapper;
import com.realestate.backend.entity.Residence;
import com.realestate.backend.repository.ResidenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResidenceService {

    private final ResidenceRepository residenceRepository;

    public List<ResidenceDTO> getAllResidences() {
        return residenceRepository.findAll().stream()
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
        if (updatedResidence.getOwner() != null) {
            existingResidence.setOwner(updatedResidence.getOwner());
        }

        Residence savedResidence = residenceRepository.save(existingResidence);
        return DtoMapper.toResidenceDTO(savedResidence);
    }

    public void deleteResidence(Long id) {
        Residence residence = findResidenceById(id);
        residenceRepository.delete(residence);
    }
}
