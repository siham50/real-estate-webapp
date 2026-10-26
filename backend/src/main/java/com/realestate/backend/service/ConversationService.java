package com.realestate.backend.service;

import com.realestate.backend.dto.ConversationDTO;
import com.realestate.backend.dto.mapper.DtoMapper;
import com.realestate.backend.entity.Conversation;
import com.realestate.backend.entity.Property;
import com.realestate.backend.entity.User;
import com.realestate.backend.repository.ConversationRepository;
import com.realestate.backend.repository.PropertyRepository;
import com.realestate.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;

    public ConversationDTO getOrCreateConversation(Conversation conversation) {
        Long user1Id = conversation.getResolvedUser1Id();
        Long user2Id = conversation.getResolvedUser2Id();
        Long propertyId = conversation.getResolvedPropertyId();

        if (user1Id == null || user2Id == null) {
            throw new IllegalArgumentException("Les identifiants user1Id et user2Id sont requis pour créer une conversation");
        }

        // Règle métier : Un utilisateur ne peut pas se parler à lui-même
        if (Objects.equals(user1Id, user2Id)) {
            throw new IllegalArgumentException("Un utilisateur ne peut pas créer une conversation avec lui-même");
        }

        // Vérifier si une conversation existe déjà
        List<Conversation> existingList;
        if (propertyId != null) {
            existingList = conversationRepository.findByUsersAndPropertyId(user1Id, user2Id, propertyId);
        } else {
            existingList = conversationRepository.findByUsersWithoutProperty(user1Id, user2Id);
        }

        if (!existingList.isEmpty()) {
            return DtoMapper.toConversationDTO(existingList.get(0));
        }

        // Récupérer les utilisateurs
        User user1 = userRepository.findById(user1Id)
                .orElseThrow(() -> new RuntimeException("Utilisateur user1 introuvable avec l'id : " + user1Id));
        User user2 = userRepository.findById(user2Id)
                .orElseThrow(() -> new RuntimeException("Utilisateur user2 introuvable avec l'id : " + user2Id));

        Property property = null;
        if (propertyId != null) {
            property = propertyRepository.findById(propertyId)
                    .orElse(null);
        }

        Conversation newConversation = Conversation.builder()
                .user1(user1)
                .user2(user2)
                .property(property)
                .build();

        Conversation saved = conversationRepository.save(newConversation);
        return DtoMapper.toConversationDTO(saved);
    }

    public List<ConversationDTO> getConversationsByUserId(Long userId) {
        return conversationRepository.findByUserId(userId).stream()
                .map(DtoMapper::toConversationDTO)
                .toList();
    }

    public Conversation findConversationEntityById(Long conversationId) {
        return conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation introuvable avec l'id : " + conversationId));
    }
}
