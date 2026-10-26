package com.realestate.backend.service;

import com.realestate.backend.dto.ReviewDTO;
import com.realestate.backend.dto.mapper.DtoMapper;
import com.realestate.backend.entity.Booking;
import com.realestate.backend.entity.Review;
import com.realestate.backend.entity.User;
import com.realestate.backend.entity.enums.BookingStatus;
import com.realestate.backend.repository.BookingRepository;
import com.realestate.backend.repository.ReviewRepository;
import com.realestate.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public ReviewDTO createReview(Review review) {
        // 1. Validation de la note (entre 1 et 5)
        if (review.getRating() == null || review.getRating() < 1 || review.getRating() > 5) {
            throw new IllegalArgumentException("La note doit être comprise entre 1 et 5");
        }

        // 2. Récupération et vérification de la réservation
        Long bookingId = review.getResolvedBookingId();
        if (bookingId == null) {
            throw new IllegalArgumentException("L'identifiant de la réservation (booking) est requis");
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Réservation introuvable avec l'id : " + bookingId));

        // Règle : Un avis n'est possible que si la réservation est COMPLETED
        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new IllegalStateException("Un avis ne peut être déposé que pour une réservation terminée (statut COMPLETED)");
        }

        // Règle : Un seul avis par réservation
        if (reviewRepository.existsByBookingId(bookingId)) {
            throw new IllegalStateException("Un avis a déjà été publié pour cette réservation");
        }

        // 3. Détermination du client (auteur) et du vendeur/propriétaire (cible)
        User client = booking.getClient();
        if (review.getResolvedClientId() != null) {
            client = userRepository.findById(review.getResolvedClientId())
                    .orElse(client);
        }

        User targetUser = null;
        if (booking.getProperty() != null && booking.getProperty().getOwner() != null) {
            targetUser = booking.getProperty().getOwner();
        } else if (booking.getAvailability() != null && booking.getAvailability().getUser() != null) {
            targetUser = booking.getAvailability().getUser();
        }

        if (review.getResolvedTargetUserId() != null) {
            targetUser = userRepository.findById(review.getResolvedTargetUserId())
                    .orElse(targetUser);
        }

        if (client == null) {
            throw new IllegalStateException("Impossible de déterminer le client pour cet avis");
        }
        if (targetUser == null) {
            throw new IllegalStateException("Impossible de déterminer le vendeur cible pour cet avis");
        }

        review.setBooking(booking);
        review.setClient(client);
        review.setTargetUser(targetUser);

        Review savedReview = reviewRepository.save(review);
        return DtoMapper.toReviewDTO(savedReview);
    }

    public List<ReviewDTO> getReviewsByTargetUserId(Long targetUserId) {
        return reviewRepository.findByTargetUserIdOrderByCreatedAtDesc(targetUserId).stream()
                .map(DtoMapper::toReviewDTO)
                .toList();
    }
}
