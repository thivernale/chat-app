package org.thivernale.chat.message;

import org.springframework.data.annotation.Id;

public record ChatNotification(@Id String id, String senderId, String recipientId, String content) {
}
