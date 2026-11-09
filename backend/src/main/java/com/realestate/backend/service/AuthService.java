package com.realestate.backend.service;

import com.realestate.backend.dto.AuthResponse;
import com.realestate.backend.dto.LoginRequest;
import com.realestate.backend.dto.RegisterRequest;
import com.realestate.backend.entity.AgencyProfile;
import com.realestate.backend.entity.User;
import com.realestate.backend.entity.enums.Role;
import com.realestate.backend.repository.AgencyProfileRepository;
import com.realestate.backend.repository.UserRepository;
import com.realestate.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final AgencyProfileRepository agencyProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

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

        // Hachage du mot de passe avec BCrypt
        String rawPassword = request.getPassword() != null ? request.getPassword() : "";
        String encodedPassword = passwordEncoder.encode(rawPassword);

        // Création du User
        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail().trim())
                .password(encodedPassword)
                .phone(request.getPhone())
                .role(role)
                .isActive(true)
                .isIdentityVerified(false)
                .build();

        User savedUser = userRepository.save(user);

        // Si professionnel, création de son AgencyProfile
        if (role == Role.PROFESSIONAL) {
            String docUrl = "";
            if (request.getDocumentUrls() != null && !request.getDocumentUrls().isEmpty()) {
                docUrl = String.join(",", request.getDocumentUrls());
            } else if (request.getDocumentUrl() != null) {
                docUrl = request.getDocumentUrl();
            }

            AgencyProfile agencyProfile = AgencyProfile.builder()
                    .user(savedUser)
                    .companyName(request.getCompanyName() != null ? request.getCompanyName() : "")
                    .rcNumber(request.getRcNumber() != null ? request.getRcNumber() : "")
                    .iceNumber(request.getIceNumber() != null ? request.getIceNumber() : "")
                    .documentUrl(docUrl)
                    .isVerified(false)
                    .build();

            agencyProfileRepository.save(agencyProfile);
        }

        String token = jwtService.generateToken(savedUser.getEmail());

        return AuthResponse.builder()
                .id(savedUser.getId())
                .email(savedUser.getEmail())
                .firstName(savedUser.getFirstName())
                .role(savedUser.getRole().name())
                .token(token)
                .message("Inscription réussie avec succès.")
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new RuntimeException("L'adresse email est requise.");
        }

        User user = userRepository.findByEmail(request.getEmail().trim())
                .orElseThrow(() -> new RuntimeException("Email ou mot de passe incorrect."));

        if (user.getPassword() == null) {
            throw new RuntimeException("Email ou mot de passe incorrect.");
        }

        // Vérification avec passwordEncoder.matches (avec support rétroactif si le mot de passe n'était pas encore haché)
        boolean matches = passwordEncoder.matches(request.getPassword(), user.getPassword());
        if (!matches && user.getPassword().equals(request.getPassword())) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            userRepository.save(user);
            matches = true;
        }

        if (!matches) {
            throw new RuntimeException("Email ou mot de passe incorrect.");
        }

        if (!user.isActive()) {
            throw new RuntimeException("Votre compte est désactivé. Veuillez contacter un administrateur.");
        }

        String token = jwtService.generateToken(user.getEmail());

        return AuthResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .role(user.getRole().name())
                .token(token)
                .message("Connexion réussie avec succès.")
                .build();
    }
}
