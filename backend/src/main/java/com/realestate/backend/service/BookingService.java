package com.realestate.backend.service;

import com.realestate.backend.dto.BookingDTO;
import com.realestate.backend.dto.mapper.DtoMapper;
import com.realestate.backend.entity.Availability;
import com.realestate.backend.entity.Booking;
import com.realestate.backend.entity.Property;
import com.realestate.backend.entity.User;
import com.realestate.backend.entity.enums.BookingStatus;
import com.realestate.backend.repository.AvailabilityRepository;
import com.realestate.backend.repository.BookingRepository;
import com.realestate.backend.repository.PropertyRepository;
import com.realestate.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final AvailabilityRepository availabilityRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public BookingDTO createBooking(Booking booking) {
        Long clientId = booking.getResolvedClientId();
        Long propertyId = booking.getResolvedPropertyId();
        Long availabilityId = booking.getResolvedAvailabilityId();

        if (clientId == null || propertyId == null || availabilityId == null) {
            throw new IllegalArgumentException("Les identifiants client, property et availability sont requis");
        }

        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client introuvable avec l'id : " + clientId));

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Propriété introuvable avec l'id : " + propertyId));

        Availability availability = availabilityRepository.findById(availabilityId)
                .orElseThrow(() -> new RuntimeException("Créneau introuvable avec l'id : " + availabilityId));

        if (availability.isBooked()) {
            throw new IllegalStateException("Le créneau sélectionné est déjà réservé");
        }

        // Marquer le créneau comme réservé
        availability.setBooked(true);
        availabilityRepository.save(availability);

        booking.setClient(client);
        booking.setProperty(property);
        booking.setAvailability(availability);
        booking.setStatus(BookingStatus.PENDING);

        Booking savedBooking = bookingRepository.save(booking);

        // Notification automatique pour le vendeur
        User vendor = property.getOwner() != null ? property.getOwner() : availability.getUser();
        if (vendor != null) {
            String clientName = (client.getFirstName() != null ? client.getFirstName() : "") + " " +
                    (client.getLastName() != null ? client.getLastName() : "");
            String propertyTitle = property.getTitle() != null ? property.getTitle() : "une propriété";
            String notificationMessage = "Nouvelle demande de visite pour \"" + propertyTitle + "\" de la part de " + clientName.trim() + ".";
            notificationService.createNotification(vendor, notificationMessage, "BOOKING_CREATED");
        }

        return DtoMapper.toBookingDTO(savedBooking);
    }

    public List<BookingDTO> getBookingsByClientId(Long clientId) {
        return bookingRepository.findByClientIdOrderByCreatedAtDesc(clientId).stream()
                .map(DtoMapper::toBookingDTO)
                .toList();
    }

    public List<BookingDTO> getBookingsByOwnerId(Long ownerId) {
        return bookingRepository.findByOwnerId(ownerId).stream()
                .map(DtoMapper::toBookingDTO)
                .toList();
    }

    public BookingDTO updateBookingStatus(Long id, BookingStatus newStatus) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Réservation introuvable avec l'id : " + id));

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new IllegalStateException("Une réservation déjà complétée ne peut plus être modifiée");
        }

        // Règles métier pour l'annulation
        if (newStatus == BookingStatus.CANCELLED) {
            Availability availability = booking.getAvailability();
            if (availability != null && availability.getDate() != null) {
                LocalDate visitDate = availability.getDate();
                LocalTime visitTime = availability.getStartTime() != null
                        ? availability.getStartTime()
                        : LocalTime.MAX;
                LocalDateTime visitDateTime = LocalDateTime.of(visitDate, visitTime);

                if (visitDateTime.isBefore(LocalDateTime.now())) {
                    throw new IllegalStateException("Impossible d'annuler une réservation dont la date est déjà passée");
                }
            }

            // Libérer le créneau d'indisponibilité
            if (availability != null) {
                availability.setBooked(false);
                availabilityRepository.save(availability);
            }
        } else if (booking.getStatus() == BookingStatus.CANCELLED && newStatus == BookingStatus.CONFIRMED) {
            // Re-confirmer une réservation précédemment annulée
            Availability availability = booking.getAvailability();
            if (availability != null) {
                if (availability.isBooked()) {
                    throw new IllegalStateException("Le créneau n'est plus disponible pour re-confirmer cette réservation");
                }
                availability.setBooked(true);
                availabilityRepository.save(availability);
            }
        }

        booking.setStatus(newStatus);
        Booking updatedBooking = bookingRepository.save(booking);
        return DtoMapper.toBookingDTO(updatedBooking);
    }
}
