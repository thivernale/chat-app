package org.thivernale.chat.message;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatMessageController {
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageService chatMessageService;

    @MessageMapping("/chat")
    public void processChatMessage(ChatMessage chatMessage) {
        chatMessage = chatMessageService.createChatMessage(chatMessage);
        messagingTemplate.convertAndSendToUser(
            chatMessage.recipientId(),
            "/queue/messages",
            new ChatNotification(chatMessage.senderId(), chatMessage.recipientId(), chatMessage.content()));
        log.info("Sent notification message: {}", chatMessage);
    }

    @GetMapping("/messages/{senderId}/{recipientId}")
    public ResponseEntity<List<ChatMessage>> getChatMessages(
        @PathVariable("senderId") String senderId,
        @PathVariable("recipientId") String recipientId
    ) {
        return ResponseEntity.ok(chatMessageService.getChatMessages(senderId, recipientId));
    }
}
