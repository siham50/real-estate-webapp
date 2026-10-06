package com.realestate.backend.controller;

import com.realestate.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TestController {

    private final UserService userService;

    @GetMapping("/test")
    public String test() {
        return "Backend Spring Boot opérationnel";
    }

    @GetMapping("/db-connection")
    public Map<String, Object> testConnection() {
        Map<String, Object> response = new HashMap<>();
        try {
            long userCount = userService.countUsers();
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