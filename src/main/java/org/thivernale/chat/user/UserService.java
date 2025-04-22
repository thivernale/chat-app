package org.thivernale.chat.user;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
class UserService {
    private final UserRepository userRepository;

    public User save(User user) {
        return userRepository.save(new User(user.username(), user.name(), Status.ONLINE));
    }

    public void disconnect(User user) {
        userRepository.findById(user.username())
            .ifPresent(dbUser -> userRepository.save(new User(dbUser.username(), dbUser.name(), Status.OFFLINE)));
    }

    public List<User> findConnectedUsers() {
        return userRepository.findAllByStatus(Status.ONLINE);
    }
}
