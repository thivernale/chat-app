package org.thivernale.chat.chatroom;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

interface ChatroomRepository extends MongoRepository<Chatroom, String> {
    Optional<Chatroom> findChatroomBySenderIdAndRecipientId(String senderId, String recipientId);
}
