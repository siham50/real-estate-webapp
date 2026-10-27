package com.realestate.backend.service;

import com.realestate.backend.dto.AuthResponse;
import com.realestate.backend.dto.LoginRequest;
import com.realestate.backend.dto.RegisterRequest;
import com.realestate.backend.entity.AgencyProfile;
import com.realestate.backend.entity.User;
import com.realestate.backend.entity.enums.Role;
import com.realestate.backend.repository.AgencyProfileRepository;
import com.realestate.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final AgencyProfileRepository agencyProfileRepository;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new RuntimeException("L'adresse email est obligatoire.");
        }

        if (userRepository.existsByEmail(request.getEmail().trim())) {
            throw new RuntimeException("Cet email est déjà associé à un compte.");
        }

        // Détermination du rôle
        Role role = Role.CLIENT;
        if (request.getRole() != null) {
            try {
                role = Role.valueOf(request.getRole().trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                role = Role.CLIENT;
            }
        }

        // Création du User
        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail().trim())
                .password(request.getPassword())
                .phone(request.getPhone())
                .role(role)
                .isActive(true)
                .isIdentityVerified(false)
                .build();

        User savedUser = userRepository.save(user);

        // Si professionnel, création de son AgencyProfile
        if (role == Role.PROFESSIONAL) {
            AgencyProfile agencyProfile = AgencyProfile.builder()
                    .user(savedUser)
                    .companyName(request.getCompanyName() != null ? request.getCompanyName() : "")
                    .rcNumber(request.getRcNumber() != null ? request.getRcNumber() : "")
                    .iceNumber(request.getIceNumber() != null ? request.getIceNumber() : "")
                    .isVerified(false)
                    .build();

            agencyProfileRepository.save(agencyProfile);
        }

        return AuthResponse.builder()
                .id(savedUser.getId())
                .email(savedUser.getEmail())
                .firstName(savedUser.getFirstName())
                .role(savedUser.getRole().name())
                .message("Inscription réussie avec succès.")
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new RuntimeException("L'adresse email est requise.");
        }

        User user = userRepository.findByEmail(request.getEmail().trim())
                .orElseThrow(() -> new RuntimeException("Email ou mot de passe incorrect."));

        if (user.getPassword() == null || !user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Email ou mot de passe incorrect.");
        }

        if (!user.isActive()) {
            throw new RuntimeException("Votre compte est désactivé. Veuillez contacter un administrateur.");
        }

        return AuthResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .role(user.getRole().name())
                .message("Connexion réussie avec succès.")
                .build();
    }
}
