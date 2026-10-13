package com.realestate.backend.service;

import com.realestate.backend.dto.UserDTO;
import com.realestate.backend.dto.mapper.DtoMapper;
import com.realestate.backend.entity.User;
import com.realestate.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public long countUsers() {
        return userRepository.count();
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(DtoMapper::toUserDTO)
                .toList();
    }

    public UserDTO getUserById(Long id) {
        User user = findUserById(id);
        return DtoMapper.toUserDTO(user);
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
}
