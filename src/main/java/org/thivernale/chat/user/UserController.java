package org.thivernale.chat.user;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Controller
@RequiredArgsConstructor
@Slf4j
public class UserController {
    private final UserService userService;

    @MessageMapping("/user.addUser")
    @SendTo("/topic/user")
    public User addUser(@Payload User user) {
        log.info("Connected user: {}", user);
        return userService.save(user);
    }

    @MessageMapping("/user.disconnectUser")
    @SendTo("/topic/user")
    public User disconnectUser(@Payload User user) {
        log.info("Disconnected user: {}", user);
        userService.disconnect(user);
        return user;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getConnectedUsers() {
        return ResponseEntity.ok(userService.findConnectedUsers());
    }
}
