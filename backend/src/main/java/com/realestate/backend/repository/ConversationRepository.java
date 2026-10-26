package com.realestate.backend.repository;

import com.realestate.backend.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    List<Conversation> findByUser1IdOrUser2Id(Long userId1, Long userId2);

    @Query("SELECT c FROM Conversation c WHERE c.user1.id = :userId OR c.user2.id = :userId ORDER BY c.createdAt DESC")
    List<Conversation> findByUserId(@Param("userId") Long userId);

    @Query("SELECT c FROM Conversation c WHERE " +
           "((c.user1.id = :u1 AND c.user2.id = :u2) OR (c.user1.id = :u2 AND c.user2.id = :u1)) " +
           "AND c.property.id = :propId")
    List<Conversation> findByUsersAndPropertyId(@Param("u1") Long u1, @Param("u2") Long u2, @Param("propId") Long propId);

    @Query("SELECT c FROM Conversation c WHERE " +
           "((c.user1.id = :u1 AND c.user2.id = :u2) OR (c.user1.id = :u2 AND c.user2.id = :u1)) " +
           "AND c.property IS NULL")
    List<Conversation> findByUsersWithoutProperty(@Param("u1") Long u1, @Param("u2") Long u2);
}
