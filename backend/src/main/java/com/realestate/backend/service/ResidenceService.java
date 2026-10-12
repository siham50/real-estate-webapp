package com.realestate.backend.service;

import com.realestate.backend.entity.Residence;
import com.realestate.backend.repository.ResidenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResidenceService {

    private final ResidenceRepository residenceRepository;

    public List<Residence> getAllResidences() {
        return residenceRepository.findAll();
    }

    public Residence getResidenceById(Long id) {
        return residenceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Residence not found"));
    }

    public Residence createResidence(Residence residence) {
        return residenceRepository.save(residence);
    }

    public Residence updateResidence(Long id, Residence updatedResidence) {
        Residence existingResidence = getResidenceById(id);

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

        return residenceRepository.save(existingResidence);
    }

    public void deleteResidence(Long id) {
        Residence residence = getResidenceById(id);
        residenceRepository.delete(residence);
    }
}
