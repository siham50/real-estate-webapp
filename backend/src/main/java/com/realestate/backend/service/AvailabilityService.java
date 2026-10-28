package com.realestate.backend.service;

import com.realestate.backend.dto.AvailabilityDTO;
import com.realestate.backend.dto.mapper.DtoMapper;
import com.realestate.backend.entity.Availability;
import com.realestate.backend.entity.User;
import com.realestate.backend.repository.AvailabilityRepository;
import com.realestate.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private final AvailabilityRepository availabilityRepository;
    private final UserRepository userRepository;

    public AvailabilityDTO createAvailability(Availability availability) {
        Long userId = availability.getResolvedUserId();
        if (userId == null) {
            throw new IllegalArgumentException("L'identifiant du vendeur (user) est requis");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Vendeur introuvable avec l'id : " + userId));

        availability.setUser(user);
        availability.setBooked(false);

        Availability saved = availabilityRepository.save(availability);
        return DtoMapper.toAvailabilityDTO(saved);
    }

    public List<AvailabilityDTO> getAvailabilitiesByUserId(Long userId) {
        return availabilityRepository.findByUserIdOrderByDateAscStartTimeAsc(userId).stream()
                .map(DtoMapper::toAvailabilityDTO)
                .toList();
    }

    public void deleteAvailability(Long id) {
        Availability availability = availabilityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Créneau introuvable avec l'id : " + id));

        if (availability.isBooked()) {
            throw new IllegalStateException("Impossible de supprimer un créneau déjà réservé");
        }

        availabilityRepository.delete(availability);
    }
}
