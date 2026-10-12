package com.realestate.backend.controller;

import com.realestate.backend.entity.Residence;
import com.realestate.backend.service.ResidenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/residences")
@RequiredArgsConstructor
public class ResidenceController {

    private final ResidenceService residenceService;

    @GetMapping
    public ResponseEntity<List<Residence>> getAllResidences() {
        return ResponseEntity.ok(residenceService.getAllResidences());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Residence> getResidenceById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(residenceService.getResidenceById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Residence> createResidence(@RequestBody Residence residence) {
        Residence created = residenceService.createResidence(residence);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Residence> updateResidence(@PathVariable Long id, @RequestBody Residence residence) {
        try {
            return ResponseEntity.ok(residenceService.updateResidence(id, residence));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResidence(@PathVariable Long id) {
        try {
            residenceService.deleteResidence(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
