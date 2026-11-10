package com.realestate.backend.service;

import com.realestate.backend.dto.UpdateProfileDTO;
import com.realestate.backend.dto.UserDTO;
import com.realestate.backend.dto.mapper.DtoMapper;
import com.realestate.backend.entity.AgencyProfile;
import com.realestate.backend.entity.User;
import com.realestate.backend.entity.enums.Role;
import com.realestate.backend.repository.AgencyProfileRepository;
import com.realestate.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AgencyProfileRepository agencyProfileRepository;

    public long countUsers() {
        return userRepository.count();
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapUserWithAgencyProfile)
                .toList();
    }

    public UserDTO getUserById(Long id) {
        User user = findUserById(id);
        return mapUserWithAgencyProfile(user);
    }

    private UserDTO mapUserWithAgencyProfile(User user) {
        if (user == null) {
            return null;
        }
        UserDTO dto = DtoMapper.toUserDTO(user);
        if (user.getRole() == Role.PROFESSIONAL) {
            agencyProfileRepository.findByUserId(user.getId()).ifPresent(profile -> {
                dto.setCompanyName(profile.getCompanyName());
                dto.setRcNumber(profile.getRcNumber());
                dto.setIceNumber(profile.getIceNumber());
                dto.setAgencyDocumentUrl(profile.getDocumentUrl());
            });
        }
        return dto;
    }

    public User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public UserDTO createUser(User user) {
        if (user.getEmail() != null && userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        User savedUser = userRepository.save(user);
        return DtoMapper.toUserDTO(savedUser);
    }

    public UserDTO updateUser(Long id, User updatedUser) {
        User existingUser = findUserById(id);

        if (updatedUser.getEmail() != null && !updatedUser.getEmail().equals(existingUser.getEmail())) {
            if (userRepository.existsByEmail(updatedUser.getEmail())) {
                throw new RuntimeException("Email already exists");
            }
            existingUser.setEmail(updatedUser.getEmail());
        }

        if (updatedUser.getFirstName() != null) {
            existingUser.setFirstName(updatedUser.getFirstName());
        }
        if (updatedUser.getLastName() != null) {
            existingUser.setLastName(updatedUser.getLastName());
        }
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank()) {
            existingUser.setPassword(updatedUser.getPassword());
        }
        if (updatedUser.getPhone() != null) {
            existingUser.setPhone(updatedUser.getPhone());
        }
        if (updatedUser.getRole() != null) {
            existingUser.setRole(updatedUser.getRole());
        }
        if (updatedUser.getIsIdentityVerified() != null) {
            existingUser.setIsIdentityVerified(updatedUser.getIsIdentityVerified());
        }
        if (updatedUser.getIdentityDocumentUrl() != null) {
            existingUser.setIdentityDocumentUrl(updatedUser.getIdentityDocumentUrl());
        }
        existingUser.setActive(updatedUser.isActive());

        User savedUser = userRepository.save(existingUser);
        return DtoMapper.toUserDTO(savedUser);
    }

    public void deleteUser(Long id) {
        User user = findUserById(id);
        userRepository.delete(user);
    }

    public UserDTO updateProfile(Long userId, UpdateProfileDTO dto) {
        User existingUser = findUserById(userId);

        if (dto.getFirstName() != null) {
            existingUser.setFirstName(dto.getFirstName().trim());
        }
        if (dto.getLastName() != null) {
            existingUser.setLastName(dto.getLastName().trim());
        }
        if (dto.getPhone() != null) {
            existingUser.setPhone(dto.getPhone().trim());
        }

        if (existingUser.getRole() == Role.PROFESSIONAL) {
            AgencyProfile agencyProfile = agencyProfileRepository.findByUserId(existingUser.getId())
                    .orElseGet(() -> AgencyProfile.builder().user(existingUser).build());

            if (dto.getCompanyName() != null) {
                agencyProfile.setCompanyName(dto.getCompanyName().trim());
            }
            if (dto.getRcNumber() != null) {
                agencyProfile.setRcNumber(dto.getRcNumber().trim());
            }
            if (dto.getIceNumber() != null) {
                agencyProfile.setIceNumber(dto.getIceNumber().trim());
            }
            agencyProfileRepository.save(agencyProfile);
        }

        User savedUser = userRepository.save(existingUser);
        return mapUserWithAgencyProfile(savedUser);
    }

    public UserDTO updateProfile(Long id, User profileData) {
        User existingUser = findUserById(id);
        if (profileData.getFirstName() != null) {
            existingUser.setFirstName(profileData.getFirstName());
        }
        if (profileData.getLastName() != null) {
            existingUser.setLastName(profileData.getLastName());
        }
        if (profileData.getPhone() != null) {
            existingUser.setPhone(profileData.getPhone());
        }
        User savedUser = userRepository.save(existingUser);
        return DtoMapper.toUserDTO(savedUser);
    }

    public UserDTO uploadIdentityDocument(Long id, String documentUrl) {
        User existingUser = findUserById(id);
        existingUser.setIdentityDocumentUrl(documentUrl);
        existingUser.setIsIdentityVerified(false); // Passe isIdentityVerified en attente
        User savedUser = userRepository.save(existingUser);
        return DtoMapper.toUserDTO(savedUser);
    }

    public UserDTO uploadCin(Long id, String cinUrl) {
        User existingUser = findUserById(id);
        existingUser.setIdentityDocumentUrl(cinUrl);
        existingUser.setIsIdentityVerified(false); // En attente de validation admin
        User savedUser = userRepository.save(existingUser);
        return DtoMapper.toUserDTO(savedUser);
    }
}
