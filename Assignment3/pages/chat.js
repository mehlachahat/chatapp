import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import io from 'socket.io-client';
import styles from '../styles/Chat.module.css';

let socket;

export default function Chat() {
  const [username, setUsername] = useState('');
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState({});
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const storedUsername = sessionStorage.getItem('username');
    if (!storedUsername) {
      router.push('/');
      return;
    }
    setUsername(storedUsername);
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!username) return;

    socketInitializer(username);

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
    // eslint-disable-next-line
  }, [username]);

  const socketInitializer = async (user) => {
    await fetch('/api/socket');
    socket = io();

    socket.on('connect', () => {
      socket.emit('register_user', user);
    });

    socket.on('online_users', (users) => {
      setOnlineUsers(users.filter(u => u !== user));
    });

    socket.on('receive_message', (data) => {
      setMessages(prevMessages => [
        ...prevMessages,
        {
          sender: data.sender,
          receiver: user,
          text: data.text,
          timestamp: data.timestamp,
        },
      ]);
      // 🟢 New: Clear unread if we're chatting with sender
      if (data.sender === recipient) {
        setUnreadMessages(prev => {
          const updated = { ...prev };
          delete updated[data.sender];
          return updated;
        });
      } else {
        setUnreadMessages(prev => ({
          ...prev,
          [data.sender]: (prev[data.sender] || 0) + 1
        }));
      }
    });

    socket.on('message_sent', () => {});

    socket.on('user_typing', (data) => {
      if (data.sender === recipient) setIsTyping(true);
    });

    socket.on('user_stop_typing', (data) => {
      if (data.sender === recipient) setIsTyping(false);
    });
  };

  const loadChatHistory = async (recipientName) => {
    try {
      const res = await fetch(
        `/api/messages?user1=${username}&user2=${recipientName}`
      );
      const history = await res.json();
      setMessages(history);

      // CLEAR unread badge for the recipient
      setUnreadMessages(prev => {
        const updated = { ...prev };
        delete updated[recipientName];
        return updated;
      });
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleUserClick = (user) => {
    setRecipient(user);
    loadChatHistory(user);
  };

  const handleRecipientChange = (e) => {
    const newRecipient = e.target.value;
    setRecipient(newRecipient);

    if (newRecipient.trim()) {
      loadChatHistory(newRecipient.trim());
    } else {
      setMessages([]);
    }
  };

  const handleTyping = () => {
    if (recipient && socket) {
      socket.emit('typing', { sender: username, receiver: recipient });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', { sender: username, receiver: recipient });
      }, 1000);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();

    if (!recipient.trim() || !message.trim()) return;

    const messageData = {
      sender: username,
      receiver: recipient.trim(),
      text: message.trim(),
    };

    socket.emit('send_message', messageData);

    setMessages(prevMessages => [
      ...prevMessages,
      {
        ...messageData,
        timestamp: new Date(),
      },
    ]);
    setMessage('');
    socket.emit('stop_typing', { sender: username, receiver: recipient });
  };

  const handleLogout = () => {
    if (socket) socket.disconnect();
    sessionStorage.removeItem('username');
    router.push('/');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Chat Application</h1>
        <div className={styles.userInfo}>
          <span className={styles.username}>
            Logged in as: <strong>{username}</strong>
          </span>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      <div className={styles.mainContainer}>
        <div className={styles.userListContainer}>
          <h3 className={styles.userListTitle}>Online Users</h3>
          <div className={styles.userList}>
            {onlineUsers.length === 0 ? (
              <p className={styles.noUsers}>No other users online</p>
            ) : (
              onlineUsers.map((user, index) => (
                <div
                  key={index}
                  className={`${styles.userItem} ${
                    recipient === user ? styles.activeUser : ''
                  }`}
                  onClick={() => handleUserClick(user)}
                >
                  <div className={styles.userItemContent}>
                    <span className={styles.onlineIndicator}>🟢</span>
                    <span className={styles.userName}>{user}</span>
                  </div>
                  {unreadMessages[user] > 0 && (
                    <span className={styles.unreadBadge}>
                      {unreadMessages[user]}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.chatContainer}>
          <div className={styles.recipientSection}>
            <label htmlFor="recipient" className={styles.label}>
              Chat with:
            </label>
            <input
              id="recipient"
              type="text"
              placeholder="Enter or select username"
              value={recipient}
              onChange={handleRecipientChange}
              className={styles.recipientInput}
            />
            {recipient && onlineUsers.includes(recipient) && (
              <span className={styles.onlineStatus}>🟢 Online</span>
            )}
          </div>

          <div className={styles.messagesContainer}>
            {messages.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No messages yet. Start a conversation!</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={
                    msg.sender === username
                      ? styles.messageSent
                      : styles.messageReceived
                  }
                >
                  <div className={styles.messageContent}>
                    <div style={{ fontSize: '0.8em', color: '#888', marginBottom: '1px' }}>
                      {msg.sender}
                    </div>
                    <p className={styles.messageText}>{msg.text}</p>
                    <span className={styles.messageTime}>
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              ))
            )}
            {isTyping && (
              <div className={styles.typingIndicator}>
                <span>{recipient} is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className={styles.messageForm}>
            <input
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={e => {
                setMessage(e.target.value);
                handleTyping();
              }}
              className={styles.messageInput}
              disabled={!recipient.trim()}
            />
            <button
              type="submit"
              className={styles.sendButton}
              disabled={!recipient.trim() || !message.trim()}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
