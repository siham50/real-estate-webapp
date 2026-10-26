package com.realestate.backend.controller;

import com.realestate.backend.dto.MessageDTO;
import com.realestate.backend.entity.Message;
import com.realestate.backend.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @PostMapping
    public ResponseEntity<MessageDTO> sendMessage(@RequestBody Message message) {
        try {
            MessageDTO created = messageService.sendMessage(message);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<List<MessageDTO>> getMessagesByConversation(@PathVariable Long conversationId) {
        try {
            return ResponseEntity.ok(messageService.getMessagesByConversationId(conversationId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PatchMapping("/conversation/{conversationId}/read")
    public ResponseEntity<Void> markMessagesAsRead(@PathVariable Long conversationId) {
        try {
            messageService.markMessagesAsRead(conversationId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
