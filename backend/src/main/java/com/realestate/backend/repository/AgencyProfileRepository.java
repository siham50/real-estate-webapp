package com.realestate.backend.repository;

import com.realestate.backend.entity.AgencyProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AgencyProfileRepository extends JpaRepository<AgencyProfile, Long> {
}
