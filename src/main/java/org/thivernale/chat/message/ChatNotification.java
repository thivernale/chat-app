package org.thivernale.chat.message;

public record ChatNotification(String senderId, String recipientId, String content) {
}
