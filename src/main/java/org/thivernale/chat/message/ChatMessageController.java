package org.thivernale.chat.message;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class ChatMessageController {
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageService chatMessageService;

    @MessageMapping("/chat")
    public void processChatMessage(ChatMessage chatMessage) {
        ChatMessage savedMessage = chatMessageService.createChatMessage(chatMessage);
        messagingTemplate.convertAndSendToUser(
            chatMessage.recipientId(),
            "/queue/messages",
            new ChatNotification(null, chatMessage.senderId(), chatMessage.recipientId(), chatMessage.content()));
    }

    @GetMapping("/messages/{senderId}/{recipientId}")
    public ResponseEntity<List<ChatMessage>> getChatMessages(
        @PathVariable String senderId,
        @PathVariable String recipientId
    ) {
        return ResponseEntity.ok(chatMessageService.getChatMessages(senderId, recipientId));
    }
}
