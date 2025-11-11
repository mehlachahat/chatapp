const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const os = require('os');
require('dotenv').config({ path: '.env.local' });

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0'; // Changed to allow network access
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI, {
  bufferCommands: false,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Message Schema
const MessageSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
  text: String,
  timestamp: { type: Date, default: Date.now },
});
MessageSchema.index({ sender: 1, receiver: 1, timestamp: -1 });
const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);

// Get network IP addresses
function getNetworkIPs() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  
  return addresses;
}

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Store connected users
  const users = {}; // { username: socket.id }
  const socketToUser = {}; // { socket.id: username }

  // Broadcast online users to all clients
  function broadcastOnlineUsers() {
    const onlineUsers = Object.keys(users);
    io.emit('online_users', onlineUsers);
  }

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Register user
    socket.on('register_user', (username) => {
      users[username] = socket.id;
      socketToUser[socket.id] = username;
      console.log(`User registered: ${username} with socket ${socket.id}`);
      
      // Broadcast updated online users list
      broadcastOnlineUsers();
      
      // Send offline messages to user
      sendOfflineMessages(username);
    });

    // Send offline messages
    async function sendOfflineMessages(username) {
      try {
        const offlineMessages = await Message.find({
          receiver: username,
          delivered: { $ne: true }
        }).sort({ timestamp: 1 });

        if (offlineMessages.length > 0) {
          console.log(`Delivering ${offlineMessages.length} offline messages to ${username}`);
          
          for (const msg of offlineMessages) {
            socket.emit('receive_message', {
              sender: msg.sender,
              text: msg.text,
              timestamp: msg.timestamp
            });
            
            // Mark as delivered
            await Message.findByIdAndUpdate(msg._id, { delivered: true });
          }
        }
      } catch (error) {
        console.error('Error sending offline messages:', error);
      }
    }

    // Handle sending messages
    socket.on('send_message', async ({ sender, receiver, text }) => {
      try {
        // Store message in MongoDB
        const message = await Message.create({
          sender,
          receiver,
          text,
          timestamp: new Date(),
          delivered: false
        });

        console.log(`Message from ${sender} to ${receiver}: ${text}`);

        // Send message to receiver if online
        const receiverSocketId = users[receiver];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receive_message', {
            sender,
            text,
            timestamp: message.timestamp
          });
          
          // Mark as delivered
          await Message.findByIdAndUpdate(message._id, { delivered: true });
        } else {
          console.log(`${receiver} is offline. Message will be delivered when they come online.`);
        }

        // Confirm message sent to sender
        socket.emit('message_sent', {
          receiver,
          text,
          timestamp: message.timestamp
        });
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', ({ sender, receiver }) => {
      const receiverSocketId = users[receiver];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_typing', { sender });
      }
    });

    // Handle stop typing
    socket.on('stop_typing', ({ sender, receiver }) => {
      const receiverSocketId = users[receiver];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_stop_typing', { sender });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      const username = socketToUser[socket.id];
      if (username) {
        delete users[username];
        delete socketToUser[socket.id];
        console.log(`User disconnected: ${username}`);
        
        // Broadcast updated online users list
        broadcastOnlineUsers();
      }
    });
  });

  server.listen(port, hostname, (err) => {
    if (err) throw err;
    
    const networkIPs = getNetworkIPs();
    
    console.log('\n🚀 Server is running!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📍 Local:    http://localhost:${port}`);
    
    if (networkIPs.length > 0) {
      console.log('\n🌐 Network Access:');
      networkIPs.forEach(ip => {
        console.log(`   http://${ip}:${port}`);
      });
      console.log('\n💡 Share these network URLs with other devices on your network!');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });
});
