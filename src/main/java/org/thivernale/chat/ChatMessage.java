package org.thivernale.chat;

public record ChatMessage(String content, String sender, MessageType type) {
}
