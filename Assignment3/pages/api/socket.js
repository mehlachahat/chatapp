export default function handler(req, res) {
    // This is a placeholder route that triggers the socket server
    // The actual socket server is initialized in server.js
    
    if (res.socket.server.io) {
      console.log('Socket is already running');
    } else {
      console.log('Socket is initializing');
    }
    res.end();
  }
  