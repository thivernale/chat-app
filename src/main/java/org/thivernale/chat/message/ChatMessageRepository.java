package org.thivernale.chat.message;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    List<ChatMessage> findChatMessagesByChatId(String chatId);
}
