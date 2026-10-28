package com.realestate.backend.repository;

import com.realestate.backend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    @Query("SELECT r FROM Review r WHERE r.targetUser.id = :targetUserId")
    List<Review> findByTargetUserId(@Param("targetUserId") Long targetUserId);

    @Query("SELECT r FROM Review r WHERE r.targetUser.id = :targetUserId ORDER BY r.createdAt DESC")
    List<Review> findByTargetUserIdOrderByCreatedAtDesc(@Param("targetUserId") Long targetUserId);

    @Query("SELECT (COUNT(r) > 0) FROM Review r WHERE r.booking.id = :bookingId")
    boolean existsByBookingId(@Param("bookingId") Long bookingId);

    @Query("SELECT r FROM Review r WHERE r.booking.id = :bookingId")
    Optional<Review> findByBookingId(@Param("bookingId") Long bookingId);
}
