package com.realestate.backend.repository;

import com.realestate.backend.entity.Availability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AvailabilityRepository extends JpaRepository<Availability, Long> {
    List<Availability> findByUserId(Long userId);
    List<Availability> findByUserIdAndIsBookedFalse(Long userId);
    List<Availability> findByUserIdOrderByDateAscStartTimeAsc(Long userId);
}
