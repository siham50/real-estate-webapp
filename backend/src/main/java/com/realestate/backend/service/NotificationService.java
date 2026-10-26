package com.realestate.backend.service;

import com.realestate.backend.dto.NotificationDTO;
import com.realestate.backend.dto.mapper.DtoMapper;
import com.realestate.backend.entity.Notification;
import com.realestate.backend.entity.User;
import com.realestate.backend.repository.NotificationRepository;
import com.realestate.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationDTO createNotification(Notification notification) {
        Long userId = notification.getResolvedUserId();
        if (userId == null) {
            throw new IllegalArgumentException("L'identifiant de l'utilisateur (user) est requis");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable avec l'id : " + userId));

        notification.setUser(user);
        notification.setRead(false);

        Notification saved = notificationRepository.save(notification);
        return DtoMapper.toNotificationDTO(saved);
    }

    public NotificationDTO createNotification(User user, String message, String type) {
        if (user == null) {
            throw new IllegalArgumentException("L'utilisateur destinataire est requis");
        }

        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .type(type)
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        return DtoMapper.toNotificationDTO(saved);
    }

    public List<NotificationDTO> getNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(DtoMapper::toNotificationDTO)
                .toList();
    }

    @Transactional
    public NotificationDTO markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification introuvable avec l'id : " + id));

        notification.setRead(true);
        Notification updated = notificationRepository.save(notification);
        return DtoMapper.toNotificationDTO(updated);
    }

    public long getUnreadCountByUserId(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }
}
