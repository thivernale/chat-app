package org.thivernale.chat.user;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document
public record User(@Id String username, String name, Status status) {
}
