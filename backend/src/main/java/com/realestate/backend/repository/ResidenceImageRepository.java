package com.realestate.backend.repository;

import com.realestate.backend.entity.ResidenceImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResidenceImageRepository extends JpaRepository<ResidenceImage, Long> {
    List<ResidenceImage> findByResidenceId(Long residenceId);
}
