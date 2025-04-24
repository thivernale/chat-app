package org.thivernale.chat.basic;

public record ChatMessage(String content, String sender, MessageType type) {
}
