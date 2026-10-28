package com.realestate.backend.controller;

import com.realestate.backend.dto.AdminStatsDTO;
import com.realestate.backend.dto.UserDTO;
import com.realestate.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
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
}
