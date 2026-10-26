package com.realestate.backend.repository;

import com.realestate.backend.entity.AgencyProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AgencyProfileRepository extends JpaRepository<AgencyProfile, Long> {
    Optional<AgencyProfile> findByUserId(Long userId);
}
