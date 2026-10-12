package com.realestate.backend.service;

import com.realestate.backend.dto.PropertyDTO;
import com.realestate.backend.dto.mapper.DtoMapper;
import com.realestate.backend.entity.Property;
import com.realestate.backend.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PropertyService {

    private final PropertyRepository propertyRepository;

    public List<PropertyDTO> getAllProperties() {
        return propertyRepository.findByIsDeletedFalse().stream()
                .map(DtoMapper::toPropertyDTO)
                .toList();
    }

    public PropertyDTO getPropertyById(Long id) {
        Property property = findPropertyById(id);
        return DtoMapper.toPropertyDTO(property);
    }

    public Property findPropertyById(Long id) {
        return propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));
    }

    public PropertyDTO createProperty(Property property) {
        Property savedProperty = propertyRepository.save(property);
        return DtoMapper.toPropertyDTO(savedProperty);
    }

    public PropertyDTO updateProperty(Long id, Property updatedProperty) {
        Property existingProperty = findPropertyById(id);

        if (updatedProperty.getTitle() != null) {
            existingProperty.setTitle(updatedProperty.getTitle());
        }
        if (updatedProperty.getDescription() != null) {
            existingProperty.setDescription(updatedProperty.getDescription());
        }
        if (updatedProperty.getType() != null) {
            existingProperty.setType(updatedProperty.getType());
        }
        if (updatedProperty.getPurpose() != null) {
            existingProperty.setPurpose(updatedProperty.getPurpose());
        }
        if (updatedProperty.getPrice() != null) {
            existingProperty.setPrice(updatedProperty.getPrice());
        }
        if (updatedProperty.getSurfaceArea() != null) {
            existingProperty.setSurfaceArea(updatedProperty.getSurfaceArea());
        }
        if (updatedProperty.getAddress() != null) {
            existingProperty.setAddress(updatedProperty.getAddress());
        }
        if (updatedProperty.getCity() != null) {
            existingProperty.setCity(updatedProperty.getCity());
        }
        if (updatedProperty.getLatitude() != null) {
            existingProperty.setLatitude(updatedProperty.getLatitude());
        }
        if (updatedProperty.getLongitude() != null) {
            existingProperty.setLongitude(updatedProperty.getLongitude());
        }
        if (updatedProperty.getVerificationStatus() != null) {
            existingProperty.setVerificationStatus(updatedProperty.getVerificationStatus());
        }
        if (updatedProperty.getResidence() != null) {
            existingProperty.setResidence(updatedProperty.getResidence());
        }
        if (updatedProperty.getOwner() != null) {
            existingProperty.setOwner(updatedProperty.getOwner());
        }

        Property savedProperty = propertyRepository.save(existingProperty);
        return DtoMapper.toPropertyDTO(savedProperty);
    }

    public void deleteProperty(Long id) {
        Property property = findPropertyById(id);
        property.setDeleted(true);
        propertyRepository.save(property);
    }
}
