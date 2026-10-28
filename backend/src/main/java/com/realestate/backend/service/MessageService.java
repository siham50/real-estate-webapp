package com.realestate.backend.service;

import com.realestate.backend.dto.MessageDTO;
import com.realestate.backend.dto.mapper.DtoMapper;
import com.realestate.backend.entity.Conversation;
import com.realestate.backend.entity.Message;
import com.realestate.backend.entity.User;
import com.realestate.backend.repository.ConversationRepository;
import com.realestate.backend.repository.MessageRepository;
import com.realestate.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;

    public MessageDTO sendMessage(Message message) {
        Long conversationId = message.getResolvedConversationId();
        Long senderId = message.getResolvedSenderId();

        if (conversationId == null || senderId == null) {
            throw new IllegalArgumentException("Les identifiants conversationId et senderId sont requis");
        }

        if (message.getContent() == null || message.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("Le contenu du message ne peut pas être vide");
        }

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation introuvable avec l'id : " + conversationId));

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Expéditeur introuvable avec l'id : " + senderId));

        // Vérifier que l'expéditeur fait bien partie de la conversation
        boolean isParticipant = (conversation.getUser1() != null && Objects.equals(conversation.getUser1().getId(), senderId)) ||
                                (conversation.getUser2() != null && Objects.equals(conversation.getUser2().getId(), senderId));
        if (!isParticipant) {
            throw new IllegalArgumentException("L'expéditeur ne participe pas à cette conversation");
        }

        message.setConversation(conversation);
        message.setSender(sender);
        message.setRead(false);

        Message saved = messageRepository.save(message);
        return DtoMapper.toMessageDTO(saved);
    }

    public List<MessageDTO> getMessagesByConversationId(Long conversationId) {
        // Vérifier existence de la conversation
        conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation introuvable avec l'id : " + conversationId));

        return messageRepository.findByConversationIdOrderByTimestampAsc(conversationId).stream()
                .map(DtoMapper::toMessageDTO)
                .toList();
    }

    @Transactional
    public void markMessagesAsRead(Long conversationId) {
        // Vérifier existence de la conversation
        conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation introuvable avec l'id : " + conversationId));

        List<Message> unreadMessages = messageRepository.findByConversationIdAndIsReadFalse(conversationId);
        if (!unreadMessages.isEmpty()) {
            for (Message msg : unreadMessages) {
                msg.setRead(true);
            }
            messageRepository.saveAll(unreadMessages);
        }
    }
}
