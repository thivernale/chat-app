'use strict';

const usernamePage = document.querySelector('#username-page');
const chatPage = document.querySelector('#chat-page');
const usernameForm = document.querySelector('#usernameForm');
const messageForm = document.querySelector('#messageForm');
const messageInput = document.querySelector('#message');
const messageArea = document.querySelector('#messages');
const connectingElement = document.querySelector('.connecting');

let stompClient = null;
let username = null;
const colors = [
  '#2196f3', '#32c787', '#00bc94', '#ff5652',
  '#ffc107', '#ff85af', '#ff9800', '#39bbb0',
];

usernameForm.addEventListener('submit', (e) => {
  e.preventDefault();

  username = e.target.elements.namedItem('name').value.trim();
  if (username) {
    usernamePage.classList.add('hidden');
    chatPage.classList.remove('hidden');

    const socket = new SockJS('/ws');
    stompClient = StompJs.Stomp.over(socket);
    stompClient.connect({}, onConnected, onError);
  }
}, true);

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const messageContent = messageInput.value;
  if (messageContent && stompClient) {
    stompClient.send('/app/chat.sendMessage', {}, JSON.stringify({
      sender: username,
      content: messageContent,
      type: 'CHAT',
    }));
    messageInput.value = '';
  }
}, true);

function onConnected() {
  // subscribe to public topic
  stompClient.subscribe('/topic/public', onMessageReceived);
  // send username to server on join
  stompClient.send('/app/chat.addUser', {}, JSON.stringify({ sender: username, type: 'JOIN' }));
  connectingElement.classList.add('hidden');
}

function onError() {
  connectingElement.textContent = 'Could not connect to the Web Socket server. Please refresh the page and try again.';
  connectingElement.classList.add('error');
}

function getAvatarColor(sender) {
  let hash = 0;
  for (let i = 0; i < sender.length; i++) {
    hash = 31 * hash + sender.charCodeAt(i);
  }
  const index = Math.abs(hash % colors.length);
  return colors[index];
}

function onMessageReceived(payload) {
  const message = JSON.parse(payload.body);
  const li = document.createElement('li');

  if (message.type === 'JOIN' || message.type === 'LEAVE') {
    li.classList.add('event-message');
    message.content = `${message.sender} ${message.type === 'JOIN' ? 'joined' : 'left'} the chat`;
  } else {
    li.classList.add('chat-message');

    const avatarElement = document.createElement('i');
    avatarElement.appendChild(document.createTextNode(message.sender[0]));
    avatarElement.style.backgroundColor = getAvatarColor(message.sender);
    li.appendChild(avatarElement);

    const usernameElement = document.createElement('span');
    usernameElement.appendChild(document.createTextNode(message.sender));
    li.appendChild(usernameElement);
  }

  const messageElement = document.createElement('p');
  messageElement.appendChild(document.createTextNode(message.content));
  li.appendChild(messageElement);

  messageArea.appendChild(li);
  messageArea.scrollTop = messageArea.scrollHeight;
}
