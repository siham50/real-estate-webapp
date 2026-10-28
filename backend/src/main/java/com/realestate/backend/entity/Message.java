package com.realestate.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "conversation_id", nullable = false)
    @JsonIgnoreProperties({"messages", "hibernateLazyInitializer", "handler"})
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sender_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User sender;

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "timestamp", nullable = false, updatable = false)
    private LocalDateTime timestamp;

    @JsonProperty("isRead")
    @Builder.Default
    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    @Transient
    private Long conversationId;

    @Transient
    private Long senderId;

    public Long getResolvedConversationId() {
        if (conversation != null && conversation.getId() != null) {
            return conversation.getId();
        }
        return conversationId;
    }

    public Long getResolvedSenderId() {
        if (sender != null && sender.getId() != null) {
            return sender.getId();
        }
        return senderId;
    }

    @PrePersist
    protected void onSend() {
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
    }
}
