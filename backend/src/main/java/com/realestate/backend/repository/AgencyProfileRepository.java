package com.realestate.backend.repository;

import com.realestate.backend.entity.AgencyProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AgencyProfileRepository extends JpaRepository<AgencyProfile, Long> {

    @Query("SELECT a FROM AgencyProfile a WHERE a.user.id = :userId")
    Optional<AgencyProfile> findByUserId(@Param("userId") Long userId);
}
