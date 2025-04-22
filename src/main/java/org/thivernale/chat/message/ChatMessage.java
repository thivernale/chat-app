package org.thivernale.chat.message;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document
public record ChatMessage(
    @Id String id,
    String chatId,
    String senderId,
    String recipientId,
    String content,
    Instant timestamp) {
}
