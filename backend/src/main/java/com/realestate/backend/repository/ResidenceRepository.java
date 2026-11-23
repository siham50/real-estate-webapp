package com.realestate.backend.repository;

import com.realestate.backend.entity.Residence;
import com.realestate.backend.entity.enums.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResidenceRepository extends JpaRepository<Residence, Long> {
    List<Residence> findByIsAvailableTrueAndIsDeletedFalse();
    List<Residence> findByVerificationStatus(VerificationStatus verificationStatus);
    List<Residence> findByVerificationStatusAndIsDeletedFalse(VerificationStatus verificationStatus);
}
