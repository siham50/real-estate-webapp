package com.realestate.backend.controller;

import com.realestate.backend.dto.PropertyDTO;
import com.realestate.backend.entity.Property;
import com.realestate.backend.service.PropertyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
public class PropertyController {

    private final PropertyService propertyService;

    @GetMapping
    public ResponseEntity<List<PropertyDTO>> getAllProperties() {
        return ResponseEntity.ok(propertyService.getAllProperties());
    }

    @GetMapping("/search")
    public ResponseEntity<List<PropertyDTO>> searchProperties(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String purpose,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice
    ) {
        return ResponseEntity.ok(propertyService.searchProperties(city, type, purpose, minPrice, maxPrice));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PropertyDTO> getPropertyById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(propertyService.getPropertyById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createProperty(@RequestBody Property property) {
        try {
            PropertyDTO created = propertyService.createProperty(property);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", e.getMessage() != null ? e.getMessage() : "Erreur lors de la création du bien.",
                    "error", e.getMessage() != null ? e.getMessage() : "Erreur lors de la création du bien."
            ));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<PropertyDTO> updateProperty(@PathVariable Long id, @RequestBody Property property) {
        try {
            return ResponseEntity.ok(propertyService.updateProperty(id, property));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProperty(@PathVariable Long id) {
        try {
            propertyService.deleteProperty(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/toggle-availability")
    public ResponseEntity<PropertyDTO> toggleAvailability(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(propertyService.toggleAvailability(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<PropertyDTO>> getAllPropertiesAdmin() {
        return ResponseEntity.ok(propertyService.getAllPropertiesAdmin());
    }

    @DeleteMapping("/{id}/hard")
    public ResponseEntity<Void> hardDeleteProperty(@PathVariable Long id) {
        try {
            propertyService.hardDeleteProperty(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/view")
    public ResponseEntity<PropertyDTO> incrementViews(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(propertyService.incrementViews(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
