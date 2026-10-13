package com.realestate.backend.repository;

import com.realestate.backend.entity.ResidenceDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResidenceDocumentRepository extends JpaRepository<ResidenceDocument, Long> {
    List<ResidenceDocument> findByResidenceId(Long residenceId);
}
