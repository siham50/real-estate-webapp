package com.realestate.backend.repository;

import com.realestate.backend.entity.Availability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AvailabilityRepository extends JpaRepository<Availability, Long> {

    @Query("SELECT a FROM Availability a WHERE a.user.id = :userId")
    List<Availability> findByUserId(@Param("userId") Long userId);

    @Query("SELECT a FROM Availability a WHERE a.user.id = :userId AND a.isBooked = false")
    List<Availability> findByUserIdAndIsBookedFalse(@Param("userId") Long userId);

    @Query("SELECT a FROM Availability a WHERE a.user.id = :userId ORDER BY a.date ASC, a.startTime ASC")
    List<Availability> findByUserIdOrderByDateAscStartTimeAsc(@Param("userId") Long userId);
}
