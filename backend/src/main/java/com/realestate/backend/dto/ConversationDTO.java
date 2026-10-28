package com.realestate.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationDTO {
    private Long id;
    private UserSummaryDTO user1;
    private UserSummaryDTO user2;
    private PropertyDTO property;
    private LocalDateTime createdAt;
    private List<MessageDTO> messages;
    private MessageDTO lastMessage;
    private long unreadCount;
}
