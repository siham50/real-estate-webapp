package com.realestate.backend.controller;

import com.realestate.backend.dto.ConversationDTO;
import com.realestate.backend.entity.Conversation;
import com.realestate.backend.service.ConversationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;

    @PostMapping
    public ResponseEntity<ConversationDTO> createOrGetConversation(@RequestBody Conversation conversation) {
        try {
            ConversationDTO result = conversationService.getOrCreateConversation(conversation);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ConversationDTO>> getConversationsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(conversationService.getConversationsByUserId(userId));
    }
}
