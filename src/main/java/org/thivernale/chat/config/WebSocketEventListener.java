package org.thivernale.chat.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.thivernale.chat.basic.ChatMessage;
import org.thivernale.chat.basic.MessageType;

@Component
@Slf4j
@RequiredArgsConstructor
public class WebSocketEventListener {
    private final SimpMessageSendingOperations messagingTemplate;

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String username = (String) headerAccessor.getSessionAttributes()
            .get("username");
        if (username != null) {
            log.info("Disconnected {} ", username);
            ChatMessage chatMessage = new ChatMessage("", username, MessageType.LEAVE);
            messagingTemplate.convertAndSend("/topic/public", chatMessage);
        }
    }
}
