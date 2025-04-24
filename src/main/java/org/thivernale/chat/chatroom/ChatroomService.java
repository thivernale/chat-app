package org.thivernale.chat.chatroom;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChatroomService {
    private final ChatroomRepository chatroomRepository;

    public Optional<String> getChatId(String senderId, String recipientId, boolean createNewIfNotExist) {
        return chatroomRepository.findChatroomBySenderIdAndRecipientId(senderId, recipientId)
            .map(Chatroom::chatId)
            .or(() -> createNewIfNotExist ?
                Optional.of(createChatId(senderId, recipientId)) :
                Optional.empty());
    }

    private String createChatId(String senderId, String recipientId) {
        final String chatId = String.format("%s_%s", senderId, recipientId);
        chatroomRepository.save(new Chatroom(null, chatId, senderId, recipientId));
        chatroomRepository.save(
            new Chatroom(null, String.format("%s_%s", recipientId, senderId), recipientId, senderId));

        return chatId;
    }
}
