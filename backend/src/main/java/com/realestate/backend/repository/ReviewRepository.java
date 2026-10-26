package com.realestate.backend.repository;

import com.realestate.backend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByTargetUserId(Long targetUserId);
    List<Review> findByTargetUserIdOrderByCreatedAtDesc(Long targetUserId);
    boolean existsByBookingId(Long bookingId);
    Optional<Review> findByBookingId(Long bookingId);
}
