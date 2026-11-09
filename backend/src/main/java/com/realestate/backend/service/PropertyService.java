package com.realestate.backend.service;

import com.realestate.backend.dto.PropertyDTO;
import com.realestate.backend.dto.mapper.DtoMapper;
import com.realestate.backend.entity.AgencyProfile;
import com.realestate.backend.entity.Property;
import com.realestate.backend.entity.PropertyDocument;
import com.realestate.backend.entity.Residence;
import com.realestate.backend.entity.User;
import com.realestate.backend.entity.enums.PropertyPurpose;
import com.realestate.backend.entity.enums.PropertyType;
import com.realestate.backend.entity.enums.Role;
import com.realestate.backend.repository.AgencyProfileRepository;
import com.realestate.backend.repository.PropertyRepository;
import com.realestate.backend.repository.ResidenceRepository;
import com.realestate.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final ResidenceRepository residenceRepository;
    private final AgencyProfileRepository agencyProfileRepository;

    public List<PropertyDTO> getAllProperties() {
        return propertyRepository.findByIsAvailableTrueAndIsDeletedFalse().stream()
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
        if (property.getOwner() != null && property.getOwner().getId() != null) {
            User owner = userRepository.findById(property.getOwner().getId())
                    .orElseThrow(() -> new RuntimeException("Owner not found"));
            property.setOwner(owner);
        }

        if (property.getOwner() != null) {
            User owner = property.getOwner();
            if (owner.getRole() == Role.PROFESSIONAL) {
                AgencyProfile agencyProfile = agencyProfileRepository.findByUserId(owner.getId())
                        .orElseThrow(() -> new RuntimeException("Votre compte agence doit être vérifié par un administrateur avant de publier."));
                if (!agencyProfile.isVerified()) {
                    throw new RuntimeException("Votre compte agence doit être vérifié par un administrateur avant de publier.");
                }
            } else if (owner.getRole() == Role.CLIENT) {
                if (!Boolean.TRUE.equals(owner.getIsIdentityVerified())) {
                    throw new RuntimeException("Vous devez faire vérifier votre CIN avant de publier.");
                }
            }
        }

        if (property.getResidence() != null && property.getResidence().getId() != null) {
            Residence residence = residenceRepository.findById(property.getResidence().getId())
                    .orElse(null);
            property.setResidence(residence);
        }

        if (property.getDocumentUrl() != null && !property.getDocumentUrl().isBlank()) {
            PropertyDocument doc = PropertyDocument.builder()
                    .property(property)
                    .documentUrl(property.getDocumentUrl())
                    .build();
            if (property.getDocuments() == null) {
                property.setDocuments(new ArrayList<>());
            }
            property.getDocuments().add(doc);
        }

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
            if (updatedProperty.getResidence().getId() != null) {
                Residence residence = residenceRepository.findById(updatedProperty.getResidence().getId())
                        .orElse(null);
                existingProperty.setResidence(residence);
            } else {
                existingProperty.setResidence(null);
            }
        }
        if (updatedProperty.getOwner() != null && updatedProperty.getOwner().getId() != null) {
            User owner = userRepository.findById(updatedProperty.getOwner().getId())
                    .orElseThrow(() -> new RuntimeException("Owner not found"));
            existingProperty.setOwner(owner);
        }

        Property savedProperty = propertyRepository.save(existingProperty);
        return DtoMapper.toPropertyDTO(savedProperty);
    }

    public void deleteProperty(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));
        property.setDeleted(true);
        propertyRepository.save(property);
    }

    public PropertyDTO toggleAvailability(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));
        property.setAvailable(!property.isAvailable());
        Property updated = propertyRepository.save(property);
        return DtoMapper.toPropertyDTO(updated);
    }

    public List<PropertyDTO> getAllPropertiesAdmin() {
        return propertyRepository.findAll().stream()
                .map(DtoMapper::toPropertyDTO)
                .toList();
    }

    public List<PropertyDTO> searchProperties(String city, String type, String purpose, BigDecimal minPrice, BigDecimal maxPrice) {
        PropertyType propertyType = null;
        if (type != null && !type.trim().isEmpty()) {
            try {
                propertyType = PropertyType.valueOf(type.trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {
            }
        }

        PropertyPurpose propertyPurpose = null;
        if (purpose != null && !purpose.trim().isEmpty()) {
            try {
                propertyPurpose = PropertyPurpose.valueOf(purpose.trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {
            }
        }

        String searchCity = (city != null && !city.trim().isEmpty()) ? city.trim() : null;

        return propertyRepository.searchProperties(searchCity, propertyType, propertyPurpose, minPrice, maxPrice).stream()
                .map(DtoMapper::toPropertyDTO)
                .toList();
    }

    public void hardDeleteProperty(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));
        propertyRepository.delete(property);
    }
}
