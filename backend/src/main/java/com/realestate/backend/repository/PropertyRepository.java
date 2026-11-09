package com.realestate.backend.repository;

import com.realestate.backend.entity.Property;
import com.realestate.backend.entity.enums.PropertyPurpose;
import com.realestate.backend.entity.enums.PropertyType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {
    List<Property> findByIsDeletedFalse();
    List<Property> findByIsAvailableTrueAndIsDeletedFalse();

    @Query("SELECT p FROM Property p WHERE p.isDeleted = false AND p.isAvailable = true " +
           "AND (:city IS NULL OR LOWER(p.city) LIKE LOWER(CONCAT('%', :city, '%'))) " +
           "AND (:type IS NULL OR p.type = :type) " +
           "AND (:purpose IS NULL OR p.purpose = :purpose) " +
           "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.price <= :maxPrice)")
    List<Property> searchProperties(
        @Param("city") String city,
        @Param("type") PropertyType type,
        @Param("purpose") PropertyPurpose purpose,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice
    );
}
