package com.realestate.backend.repository;

import com.realestate.backend.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("SELECT b FROM Booking b WHERE b.client.id = :clientId")
    List<Booking> findByClientId(@Param("clientId") Long clientId);

    @Query("SELECT b FROM Booking b WHERE b.client.id = :clientId ORDER BY b.createdAt DESC")
    List<Booking> findByClientIdOrderByCreatedAtDesc(@Param("clientId") Long clientId);

    @Query("SELECT b FROM Booking b WHERE b.property.owner.id = :ownerId OR b.availability.user.id = :ownerId ORDER BY b.createdAt DESC")
    List<Booking> findByOwnerId(@Param("ownerId") Long ownerId);

    @Query("SELECT b FROM Booking b WHERE b.property.owner.id = :ownerId ORDER BY b.createdAt DESC")
    List<Booking> findByPropertyOwnerIdOrderByCreatedAtDesc(@Param("ownerId") Long ownerId);
}
