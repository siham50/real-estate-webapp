package com.realestate.backend.dto.mapper;

import com.realestate.backend.dto.*;
import com.realestate.backend.entity.Property;
import com.realestate.backend.entity.Residence;
import com.realestate.backend.entity.User;

public class DtoMapper {

    private DtoMapper() {
        // Private constructor for utility class
    }

    public static UserDTO toUserDTO(User user) {
        if (user == null) {
            return null;
        }
        return UserDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .isIdentityVerified(user.getIsIdentityVerified())
                .isActive(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public static UserSummaryDTO toUserSummaryDTO(User user) {
        if (user == null) {
            return null;
        }
        return UserSummaryDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    public static ResidenceDTO toResidenceDTO(Residence residence) {
        if (residence == null) {
            return null;
        }
        return ResidenceDTO.builder()
                .id(residence.getId())
                .name(residence.getName())
                .description(residence.getDescription())
                .address(residence.getAddress())
                .city(residence.getCity())
                .latitude(residence.getLatitude())
                .longitude(residence.getLongitude())
                .createdAt(residence.getCreatedAt())
                .isAvailable(residence.isAvailable())
                .isDeleted(residence.isDeleted())
                .owner(toUserSummaryDTO(residence.getOwner()))
                .build();
    }

    public static ResidenceSummaryDTO toResidenceSummaryDTO(Residence residence) {
        if (residence == null) {
            return null;
        }
        return ResidenceSummaryDTO.builder()
                .id(residence.getId())
                .name(residence.getName())
                .city(residence.getCity())
                .build();
    }

    public static PropertyDTO toPropertyDTO(Property property) {
        if (property == null) {
            return null;
        }
        return PropertyDTO.builder()
                .id(property.getId())
                .title(property.getTitle())
                .description(property.getDescription())
                .type(property.getType())
                .purpose(property.getPurpose())
                .price(property.getPrice())
                .surfaceArea(property.getSurfaceArea())
                .address(property.getAddress())
                .city(property.getCity())
                .latitude(property.getLatitude())
                .longitude(property.getLongitude())
                .verificationStatus(property.getVerificationStatus())
                .isDeleted(property.isDeleted())
                .isAvailable(property.isAvailable())
                .createdAt(property.getCreatedAt())
                .updatedAt(property.getUpdatedAt())
                .owner(toUserSummaryDTO(property.getOwner()))
                .residence(toResidenceSummaryDTO(property.getResidence()))
                .build();
    }
}
