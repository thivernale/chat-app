package org.thivernale.chat.user;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

interface UserRepository extends MongoRepository<User, String> {
    List<User> findAllByStatus(Status status);
}
