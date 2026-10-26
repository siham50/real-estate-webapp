package com.realestate.backend.repository;

import com.realestate.backend.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByConversationIdOrderByTimestampAsc(Long conversationId);

    List<Message> findByConversationIdAndIsReadFalse(Long conversationId);

    Optional<Message> findFirstByConversationIdOrderByTimestampDesc(Long conversationId);

    long countByConversationIdAndIsReadFalse(Long conversationId);
}
