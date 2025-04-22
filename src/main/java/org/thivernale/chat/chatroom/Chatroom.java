package org.thivernale.chat.chatroom;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document
public record Chatroom(@Id String id, String chatId, String senderId, String recipientId) {
}
