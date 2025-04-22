package org.thivernale.chat.message;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.thivernale.chat.chatroom.ChatroomService;

import java.time.Instant;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
class ChatMessageService {
    private final ChatMessageRepository chatMessageRepository;
    private final ChatroomService chatroomService;

    public ChatMessage createChatMessage(ChatMessage chatMessage) {
        String chatId = chatroomService.getChatId(chatMessage.senderId(), chatMessage.recipientId(), true)
            .orElseThrow();
        return chatMessageRepository.save(new ChatMessage(null, chatId, chatMessage.senderId(),
            chatMessage.recipientId(), chatMessage.content(), Instant.now()));
    }

    public List<ChatMessage> getChatMessages(String senderId, String recipientId) {
        return chatroomService.getChatId(senderId, recipientId, false)
            .map(chatMessageRepository::findChatMessagesByChatId)
            .orElse(Collections.emptyList());
    }
}
