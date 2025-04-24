'use strict';

const usernamePage = document.querySelector('#username-page');
const chatPage = document.querySelector('#chat-page');
const usernameForm = document.querySelector('#usernameForm');
const messageForm = document.querySelector('#messageForm');
const messageInput = document.querySelector('#message');
const chatArea = document.querySelector('#chat-messages');
const logout = document.querySelector('#logout');
const connectingElement = document.querySelector('.connecting');

let stompClient = null;
let username = null;
let name = null;
let selectedUserId = null;
const colors = [
  '#2196f3', '#32c787', '#00bc94', '#ff5652',
  '#ffc107', '#ff85af', '#ff9800', '#39bbb0',
];
let reconnectTimeout;

usernameForm.addEventListener('submit', (e) => {
  e.preventDefault();

  username = e.target.elements.namedItem('username').value.trim();
  name = e.target.elements.namedItem('name').value.trim();
  if (username && name) {
    usernamePage.classList.add('hidden');
    chatPage.classList.remove('hidden');

    const socket = () => new SockJS('/ws');
    stompClient = StompJs.Stomp.over(socket);
    stompClient.reconnectDelay = 5000;
    stompClient.connect({}, onConnected, onError, onWebSocketClose);
  }
}, true);

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const messageContent = messageInput.value;
  if (messageContent && stompClient) {
    stompClient.send('/app/chat', {}, JSON.stringify({
      senderId: username,
      recipientId: selectedUserId,
      content: messageContent,
      timestamp: new Date().toISOString(),
    }));
    messageInput.value = '';
    updateChat([{ senderId: username, content: messageContent }]);
  }
}, true);

logout.addEventListener('click', onLogout);

window.onbeforeunload = () => onLogout();

function onLogout() {
  // disconnect user
  stompClient.send('/app/user.disconnectUser', {}, JSON.stringify({ username, name, status: 'OFFLINE' }));
  window.location.reload();
}

function onConnected() {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }
  // subscribe to own queue
  stompClient.subscribe(`/user/${username}/queue/messages`, onMessageReceived);
  // subscribe to common topic
  stompClient.subscribe(`/topic/user`, onMessageReceived);

  // register user
  stompClient.send('/app/user.addUser', {}, JSON.stringify({ username, name, status: 'ONLINE' }));

  document.querySelector('#connected-user-name').textContent = name;
  // find and display connected users
  findAndDisplayConnectedUsers().then();
  connectingElement.classList.add('hidden');
}

async function findAndDisplayConnectedUsers() {
  const url = `/users`;
  const connectedUsers = await fetch(url, {})
    .then(response => response.json())
    .then(data => data.filter(u => u.username !== username));

  const connectedUsersList = document.querySelector('#connectedUsers');
  connectedUsersList.innerHTML = '';
  connectedUsers.forEach(user => appendUserElement(user, connectedUsersList));
}

function appendUserElement(user, connectedUsersList) {
  const userItemElement = document.createElement('li');
  userItemElement.classList.add('user-item');
  userItemElement.id = user.username;
  userItemElement.appendChild(createAvatarElement(user.username));
  userItemElement.appendChild(createUsernameElement(user.name));

  const receivedMessages = document.createElement('span');
  receivedMessages.textContent = '0';
  receivedMessages.classList.add('nbr-msg', 'hidden');
  userItemElement.appendChild(receivedMessages);

  userItemElement.addEventListener('click', startChat);

  connectedUsersList.appendChild(userItemElement);
}

function startChat(e) {
  document.querySelectorAll('.user-item').forEach(item => {
    item.classList.remove('active');
  });
  const userItemElement = e.currentTarget;
  userItemElement.classList.add('active');
  messageForm.classList.remove('hidden');
  selectedUserId = userItemElement.getAttribute('id');

  fetchAndDisplayUserChat(selectedUserId).then();

  const nbrMsg = userItemElement.querySelector('.nbr-msg');
  nbrMsg.classList.add('hidden');
}

async function fetchAndDisplayUserChat(recipientId) {
  const url = `/messages/${username}/${recipientId}`;
  const messages = await fetch(url, {})
    .then(response => response.json());
  console.log(messages);
  updateChat(messages, true);
}

function updateChat(messages = [], clear = false) {
  if (clear) {
    chatArea.innerHTML = '';
  }
  messages.forEach(message => chatArea.appendChild(createMessageItemElement(message.senderId, message.content)));
  chatArea.scrollTop = chatArea.scrollHeight;
}

function createMessageItemElement(senderId, content) {
  const messageItemElement = document.createElement('div');
  messageItemElement.classList.add('message');
  if (senderId === username) {
    messageItemElement.classList.add('sender');
  } else {
    messageItemElement.classList.add('receiver');
  }
  const messageElement = document.createElement('p');
  messageElement.textContent = content;
  messageItemElement.appendChild(messageElement);
  return messageItemElement;
}

function onError() {
  connectingElement.textContent = 'Could not connect to the Web Socket server. Please refresh the page and try again.';
  connectingElement.classList.add('error');
  connectingElement.classList.remove('hidden');
}

function onWebSocketClose() {
  connectingElement.textContent = 'Web Socket connection closed. Attempting to reconnect...';
  connectingElement.classList.add('error');
  connectingElement.classList.remove('hidden');
  reconnectTimeout = setTimeout(() => {
    if (!stompClient.connected) {
      stompClient.deactivate();
      connectingElement.textContent = 'Cannot connect to the Web Socket server. Please refresh the page and try again.';
    }
  }, stompClient.reconnectDelay * 5);
}

function getAvatarColor(sender) {
  let hash = 0;
  for (let i = 0; i < sender.length; i++) {
    hash = 31 * hash + sender.charCodeAt(i);
  }
  const index = Math.abs(hash % colors.length);
  return colors[index];
}

function createAvatarElement(username) {
  const avatarElement = document.createElement('i');
  avatarElement.appendChild(document.createTextNode(username[0]));
  avatarElement.style.backgroundColor = getAvatarColor(username);
  return avatarElement;
}

function createUsernameElement(username) {
  const usernameElement = document.createElement('span');
  usernameElement.appendChild(document.createTextNode(username));
  return usernameElement;
}

async function onMessageReceived(payload) {
  // find and display connected users
  await findAndDisplayConnectedUsers();

  const message = JSON.parse(payload.body);
  if (selectedUserId && selectedUserId === message.senderId) {
    updateChat([message]);
  }

  const userItemElement = document.querySelector(`#${message.senderId}`);
  if (selectedUserId) {
    if (userItemElement) {
      userItemElement.classList.add('active');
    }
  } else {
    messageForm.classList.add('hidden');
  }
  if (userItemElement && !userItemElement.classList.contains('active')) {
    const nbrMsg = userItemElement.querySelector('.nbr-msg');
    nbrMsg.classList.remove('hidden');
    nbrMsg.textContent = '';
  }
}
