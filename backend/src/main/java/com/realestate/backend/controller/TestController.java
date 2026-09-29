package com.realestate.backend.controller;

import com.realestate.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class TestController {

    private final UserRepository userRepository;

    @GetMapping("/db-connection")
    public Map<String, Object> testConnection() {
        Map<String, Object> response = new HashMap<>();
        try {
            long userCount = userRepository.count();
            response.put("status", "SUCCESS");
            response.put("message", "Connexion MySQL établie avec succès !");
            response.put("userCount", userCount);
        } catch (Exception e) {
            response.put("status", "ERROR");
            response.put("message", e.getMessage());
        }
        return response;
    }
}
