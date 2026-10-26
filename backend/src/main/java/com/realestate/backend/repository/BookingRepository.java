package com.realestate.backend.repository;

import com.realestate.backend.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByClientId(Long clientId);
    List<Booking> findByClientIdOrderByCreatedAtDesc(Long clientId);

    @Query("SELECT b FROM Booking b WHERE b.property.owner.id = :ownerId OR b.availability.user.id = :ownerId ORDER BY b.createdAt DESC")
    List<Booking> findByOwnerId(@Param("ownerId") Long ownerId);

    List<Booking> findByPropertyOwnerIdOrderByCreatedAtDesc(Long ownerId);
}

