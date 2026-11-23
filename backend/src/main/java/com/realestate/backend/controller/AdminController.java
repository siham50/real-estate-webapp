package com.realestate.backend.controller;

import com.realestate.backend.dto.AdminStatsDTO;
import com.realestate.backend.dto.PropertyDTO;
import com.realestate.backend.dto.ResidenceDTO;
import com.realestate.backend.dto.UserDTO;
import com.realestate.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDTO> getStats() {
        return ResponseEntity.ok(adminService.getAdminStats());
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<UserDTO> updateUserStatus(
            @PathVariable Long id,
            @RequestParam("isActive") boolean isActive) {
        try {
            return ResponseEntity.ok(adminService.updateUserStatus(id, isActive));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/verify/{userId}")
    public ResponseEntity<UserDTO> verifyUser(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(adminService.verifyUser(userId));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/pending-listings")
    public ResponseEntity<Map<String, Object>> getPendingListings() {
        return ResponseEntity.ok(adminService.getPendingListings());
    }

    @PatchMapping({"/approve-property/{id}", "/verify-property/{id}", "/verify-listing/property/{id}"})
    public ResponseEntity<PropertyDTO> verifyPropertyListing(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(adminService.verifyProperty(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping({"/reject-property/{id}", "/reject-listing/property/{id}"})
    public ResponseEntity<PropertyDTO> rejectPropertyListing(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(adminService.rejectProperty(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping({"/approve-residence/{id}", "/verify-residence/{id}", "/verify-listing/residence/{id}"})
    public ResponseEntity<ResidenceDTO> verifyResidenceListing(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(adminService.verifyResidence(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping({"/reject-residence/{id}", "/reject-listing/residence/{id}"})
    public ResponseEntity<ResidenceDTO> rejectResidenceListing(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(adminService.rejectResidence(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
