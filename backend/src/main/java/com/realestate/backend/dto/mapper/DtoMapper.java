package com.realestate.backend.dto.mapper;

import com.realestate.backend.dto.*;
import com.realestate.backend.entity.Availability;
import com.realestate.backend.entity.Booking;
import com.realestate.backend.entity.Conversation;
import com.realestate.backend.entity.Message;
import com.realestate.backend.entity.Notification;
import com.realestate.backend.entity.Property;
import com.realestate.backend.entity.PropertyDocument;
import com.realestate.backend.entity.Report;
import com.realestate.backend.entity.Residence;
import com.realestate.backend.entity.ResidenceDocument;
import com.realestate.backend.entity.ResidenceImage;
import com.realestate.backend.entity.Review;
import com.realestate.backend.entity.User;

import java.util.Collections;
import java.util.List;

public class DtoMapper {

    private DtoMapper() {
        // Private constructor for utility class
    }

    public static UserDTO toUserDTO(User user) {
        if (user == null) {
            return null;
        }
        return UserDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .isIdentityVerified(user.getIsIdentityVerified())
                .isActive(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public static UserSummaryDTO toUserSummaryDTO(User user) {
        if (user == null) {
            return null;
        }
        return UserSummaryDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    public static ResidenceDocumentDTO toResidenceDocumentDTO(ResidenceDocument doc) {
        if (doc == null) {
            return null;
        }
        return ResidenceDocumentDTO.builder()
                .id(doc.getId())
                .documentUrl(doc.getDocumentUrl())
                .uploadedAt(doc.getUploadedAt())
                .build();
    }

    public static ResidenceImageDTO toResidenceImageDTO(ResidenceImage img) {
        if (img == null) return null;
        return ResidenceImageDTO.builder()
                .id(img.getId())
                .imageUrl(img.getImageUrl())
                .isPrimary(img.isPrimary())
                .build();
    }

    public static PropertyDocumentDTO toPropertyDocumentDTO(PropertyDocument doc) {
        if (doc == null) {
            return null;
        }
        return PropertyDocumentDTO.builder()
                .id(doc.getId())
                .documentUrl(doc.getDocumentUrl())
                .uploadedAt(doc.getUploadedAt())
                .build();
    }

    public static ResidenceDTO toResidenceDTO(Residence residence) {
        if (residence == null) {
            return null;
        }
        return ResidenceDTO.builder()
                .id(residence.getId())
                .name(residence.getName())
                .description(residence.getDescription())
                .address(residence.getAddress())
                .city(residence.getCity())
                .latitude(residence.getLatitude())
                .longitude(residence.getLongitude())
                .createdAt(residence.getCreatedAt())
                .updatedAt(residence.getUpdatedAt())
                .isAvailable(residence.isAvailable())
                .isDeleted(residence.isDeleted())
                .verificationStatus(residence.getVerificationStatus())
                .owner(toUserSummaryDTO(residence.getOwner()))
                .images(residence.getImages() != null
                        ? residence.getImages().stream()
                                .map(DtoMapper::toResidenceImageDTO)
                                .toList()
                        : List.of())
                .documents(residence.getDocuments() != null
                        ? residence.getDocuments().stream()
                                .map(DtoMapper::toResidenceDocumentDTO)
                                .toList()
                        : Collections.emptyList())
                .build();
    }

    public static ResidenceSummaryDTO toResidenceSummaryDTO(Residence residence) {
        if (residence == null) {
            return null;
        }
        return ResidenceSummaryDTO.builder()
                .id(residence.getId())
                .name(residence.getName())
                .city(residence.getCity())
                .build();
    }

    public static PropertyDTO toPropertyDTO(Property property) {
        if (property == null) {
            return null;
        }
        return PropertyDTO.builder()
                .id(property.getId())
                .title(property.getTitle())
                .description(property.getDescription())
                .type(property.getType())
                .purpose(property.getPurpose())
                .price(property.getPrice())
                .surfaceArea(property.getSurfaceArea())
                .address(property.getAddress())
                .city(property.getCity())
                .latitude(property.getLatitude())
                .longitude(property.getLongitude())
                .verificationStatus(property.getVerificationStatus())
                .isDeleted(property.isDeleted())
                .isAvailable(property.isAvailable())
                .createdAt(property.getCreatedAt())
                .updatedAt(property.getUpdatedAt())
                .owner(toUserSummaryDTO(property.getOwner()))
                .residence(toResidenceSummaryDTO(property.getResidence()))
                .documents(property.getDocuments() != null
                        ? property.getDocuments().stream()
                                .map(DtoMapper::toPropertyDocumentDTO)
                                .toList()
                        : List.of())
                .build();
    }

    public static AvailabilityDTO toAvailabilityDTO(Availability availability) {
        if (availability == null) {
            return null;
        }
        return AvailabilityDTO.builder()
                .id(availability.getId())
                .user(toUserSummaryDTO(availability.getUser()))
                .date(availability.getDate())
                .startTime(availability.getStartTime())
                .endTime(availability.getEndTime())
                .isBooked(availability.isBooked())
                .build();
    }

    public static BookingDTO toBookingDTO(Booking booking) {
        if (booking == null) {
            return null;
        }
        return BookingDTO.builder()
                .id(booking.getId())
                .client(toUserSummaryDTO(booking.getClient()))
                .property(toPropertyDTO(booking.getProperty()))
                .availability(toAvailabilityDTO(booking.getAvailability()))
                .status(booking.getStatus())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }

    public static ReviewDTO toReviewDTO(Review review) {
        if (review == null) {
            return null;
        }
        return ReviewDTO.builder()
                .id(review.getId())
                .bookingId(review.getBooking() != null ? review.getBooking().getId() : null)
                .client(toUserSummaryDTO(review.getClient()))
                .targetUser(toUserSummaryDTO(review.getTargetUser()))
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }

    public static ReportDTO toReportDTO(Report report) {
        if (report == null) {
            return null;
        }
        return ReportDTO.builder()
                .id(report.getId())
                .reporter(toUserSummaryDTO(report.getReporter()))
                .reportedUser(toUserSummaryDTO(report.getReportedUser()))
                .reason(report.getReason())
                .status(report.getStatus())
                .createdAt(report.getCreatedAt())
                .build();
    }

    public static MessageDTO toMessageDTO(Message message) {
        if (message == null) {
            return null;
        }
        return MessageDTO.builder()
                .id(message.getId())
                .conversationId(message.getConversation() != null ? message.getConversation().getId() : null)
                .sender(toUserSummaryDTO(message.getSender()))
                .content(message.getContent())
                .timestamp(message.getTimestamp())
                .isRead(message.isRead())
                .build();
    }

    public static ConversationDTO toConversationDTO(Conversation conversation) {
        if (conversation == null) {
            return null;
        }
        List<MessageDTO> messageDTOs = conversation.getMessages() != null
                ? conversation.getMessages().stream()
                        .map(DtoMapper::toMessageDTO)
                        .toList()
                : Collections.emptyList();

        MessageDTO lastMessage = messageDTOs.isEmpty() ? null : messageDTOs.get(messageDTOs.size() - 1);
        long unreadCount = messageDTOs.stream().filter(m -> !m.isRead()).count();

        return ConversationDTO.builder()
                .id(conversation.getId())
                .user1(toUserSummaryDTO(conversation.getUser1()))
                .user2(toUserSummaryDTO(conversation.getUser2()))
                .property(toPropertyDTO(conversation.getProperty()))
                .createdAt(conversation.getCreatedAt())
                .messages(messageDTOs)
                .lastMessage(lastMessage)
                .unreadCount(unreadCount)
                .build();
    }

    public static NotificationDTO toNotificationDTO(Notification notification) {
        if (notification == null) {
            return null;
        }
        return NotificationDTO.builder()
                .id(notification.getId())
                .user(toUserSummaryDTO(notification.getUser()))
                .message(notification.getMessage())
                .type(notification.getType())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }

    public static AdminStatsDTO toAdminStatsDTO(long totalUsers, long totalProperties, long totalBookings, long pendingReports) {
        return AdminStatsDTO.builder()
                .totalUsers(totalUsers)
                .totalProperties(totalProperties)
                .totalBookings(totalBookings)
                .pendingReports(pendingReports)
                .build();
    }
}


