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
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional
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

        // Notification automatique pour le propriétaire / vendeur
        Long ownerId = property.getOwner() != null ? property.getOwner().getId() : (availability.getUser() != null ? availability.getUser().getId() : null);
        if (ownerId != null) {
            notificationService.createNotification(ownerId, "Nouvelle demande de visite pour votre bien.", "BOOKING");
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

    @Transactional
    public BookingDTO cancelBooking(Long id, String reason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Réservation introuvable avec l'id : " + id));

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new IllegalStateException("Une réservation déjà complétée ne peut plus être modifiée");
        }

        // Libérer le créneau d'indisponibilité
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

        if (availability != null) {
            availability.setBooked(false);
            availabilityRepository.save(availability);
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason(reason);
        Booking updatedBooking = bookingRepository.save(booking);

        // Notification au vendeur / propriétaire
        Long ownerId = null;
        if (updatedBooking.getProperty() != null && updatedBooking.getProperty().getOwner() != null) {
            ownerId = updatedBooking.getProperty().getOwner().getId();
        } else if (availability != null && availability.getUser() != null) {
            ownerId = availability.getUser().getId();
        }

        if (ownerId != null) {
            String message = (reason != null && !reason.trim().isEmpty())
                    ? "Le client a annulé la visite. Raison : " + reason.trim()
                    : "Le client a annulé la visite.";
            notificationService.createNotification(ownerId, message, "BOOKING");
        }

        return DtoMapper.toBookingDTO(updatedBooking);
    }

    @Transactional
    public BookingDTO rescheduleBooking(Long id, Long newAvailabilityId) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Réservation introuvable avec l'id : " + id));

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new IllegalStateException("Une réservation déjà complétée ne peut pas être replanifiée");
        }

        // 1. Libérer l'ancien créneau
        Availability oldAvailability = booking.getAvailability();
        if (oldAvailability != null) {
            oldAvailability.setBooked(false);
            availabilityRepository.save(oldAvailability);
        }

        // 2. Réserver le nouveau créneau
        Availability newAvailability = availabilityRepository.findById(newAvailabilityId)
                .orElseThrow(() -> new RuntimeException("Nouveau créneau introuvable avec l'id : " + newAvailabilityId));

        if (newAvailability.isBooked()) {
            throw new IllegalStateException("Le créneau sélectionné est déjà réservé");
        }

        newAvailability.setBooked(true);
        availabilityRepository.save(newAvailability);

        // 3. Mettre à jour la réservation
        booking.setAvailability(newAvailability);
        booking.setStatus(BookingStatus.RESCHEDULED);
        Booking updatedBooking = bookingRepository.save(booking);

        // 4. Notification au client
        User client = updatedBooking.getClient();
        Long clientId = client != null ? client.getId() : booking.getResolvedClientId();
        if (clientId != null) {
            notificationService.createNotification(clientId, "L'agence a proposé une nouvelle date pour votre visite.", "BOOKING");
        }

        return DtoMapper.toBookingDTO(updatedBooking);
    }

    @Transactional
    public BookingDTO respondToReschedule(Long id, boolean accept) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Réservation introuvable avec l'id : " + id));

        if (booking.getStatus() != BookingStatus.RESCHEDULED) {
            throw new IllegalStateException("Cette réservation n'est pas en attente de réponse à une replanification");
        }

        Availability availability = booking.getAvailability();

        if (accept) {
            booking.setStatus(BookingStatus.CONFIRMED);
        } else {
            booking.setStatus(BookingStatus.CANCELLED);
            booking.setCancellationReason("Replanification refusée par le client");
            if (availability != null) {
                availability.setBooked(false);
                availabilityRepository.save(availability);
            }
        }

        Booking updatedBooking = bookingRepository.save(booking);

        // Notification à l'agence / au propriétaire
        Long ownerId = null;
        if (updatedBooking.getProperty() != null && updatedBooking.getProperty().getOwner() != null) {
            ownerId = updatedBooking.getProperty().getOwner().getId();
        } else if (availability != null && availability.getUser() != null) {
            ownerId = availability.getUser().getId();
        }

        if (ownerId != null) {
            String message = accept
                    ? "Le client a accepté la nouvelle date pour la visite."
                    : "Le client a refusé la nouvelle date pour la visite.";
            notificationService.createNotification(ownerId, message, "BOOKING");
        }

        return DtoMapper.toBookingDTO(updatedBooking);
    }

    @Transactional
    public BookingDTO updateBookingStatus(Long id, BookingStatus newStatus) {
        return updateBookingStatus(id, newStatus, null);
    }

    @Transactional
    public BookingDTO updateBookingStatus(Long id, BookingStatus newStatus, String reason) {
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

            if (reason != null && !reason.trim().isEmpty()) {
                booking.setCancellationReason(reason.trim());
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

        // Notifications automatiques pour le client
        User client = updatedBooking.getClient();
        Long clientId = client != null ? client.getId() : booking.getResolvedClientId();
        if (clientId != null) {
            if (newStatus == BookingStatus.CONFIRMED) {
                notificationService.createNotification(clientId, "Votre visite a été confirmée.", "BOOKING");
            } else if (newStatus == BookingStatus.CANCELLED) {
                String notifMsg = (reason != null && !reason.trim().isEmpty())
                        ? "Votre visite a été annulée. Raison : " + reason.trim()
                        : "Votre visite a été annulée.";
                notificationService.createNotification(clientId, notifMsg, "BOOKING");
            } else if (newStatus == BookingStatus.COMPLETED) {
                notificationService.createNotification(clientId, "Votre visite est terminée. Vous pouvez laisser un avis.", "BOOKING");
            }
        }

        // Si annulé, notifier également le vendeur
        if (newStatus == BookingStatus.CANCELLED) {
            Long ownerId = null;
            if (updatedBooking.getProperty() != null && updatedBooking.getProperty().getOwner() != null) {
                ownerId = updatedBooking.getProperty().getOwner().getId();
            } else if (booking.getAvailability() != null && booking.getAvailability().getUser() != null) {
                ownerId = booking.getAvailability().getUser().getId();
            }
            if (ownerId != null) {
                String ownerMsg = (reason != null && !reason.trim().isEmpty())
                        ? "Le client a annulé la visite. Raison : " + reason.trim()
                        : "La visite a été annulée.";
                notificationService.createNotification(ownerId, ownerMsg, "BOOKING");
            }
        }

        return DtoMapper.toBookingDTO(updatedBooking);
    }
}
