# Private Messaging Application

---

## Overview

This assignment implements a real-time, one-to-one private messaging application using **Next.js** for the frontend and **Socket.io** for real-time communication. The application allows users to send and receive messages securely in a private chat interface. It also stores chat history in a **MongoDB** database to ensure messages are available even when users are offline or reconnect.

### Key Features
- **User Authentication**: Users enter a username to connect and gain access to the chat system.
- **Real-Time Messaging**: Using **Socket.io**, users can send and receive messages instantly.
- **Chat History**: Messages are stored in a **MongoDB** database and are retrieved on user login to show the previous chat history.
- **Private Messaging**: Users can message one another privately using the app's chat interface.
- **Responsive UI**: The chat interface is designed with either **CSS Modules** or **Tailwind CSS** for a clean, user-friendly experience.

---

## Installation

### Install Node.js

On Ubuntu:

```shell
sudo apt install nodejs
```

On Fedora:

```shell
sudo dnf install nodejs
```

Alternatively, using nvm

```shell
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
\. "$HOME/.nvm/nvm.sh"
nvm install 22
```

### Install MongoDB

On Ububtu:

```shell
sudo apt-get install gnupg curl
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
sudo apt-get update
sudo apt-get install mongodb-org
```

On Fedora:

```shell
sudo nano /etc/yum.repos.d/mongodb-org-8.2.repo
...
[mongodb-org-8.2]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/9/mongodb-org/8.2/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://pgp.mongodb.com/server-8.0.asc
...
sudo yum install mongodb-org
```

Start MongoDB and check status:

```shell
sudo systemctl start mongod
sudo systemctl status mongod
```

## Run the Application

```shell
git clone https://github.com/MTech-IT-MNS-2025/Group-1/tree/main/Assignment3
```

```shell
cd Assignment3
npm install
npm run dev
#Open in browser: http://localhost:3000
```

### Architecture
1. **Frontend**: Built with **Next.js**, using pages for routing and API routes for server-side operations. The chat page interacts with Socket.io for real-time message delivery and fetches chat history from the server.
2. **Backend**: A simple **Node.js** server using **Socket.io** to manage user connections, message routing, and real-time communication. Messages are stored and retrieved from **MongoDB**.
3. **Socket Communication**: The server listens for user connections, registers them by username, and handles private message routing to the appropriate user.
4. **Database Interaction**: **MongoDB** stores messages with the sender, receiver, and timestamp, ensuring chat history is retained and available.

```shell
messaging-app
|
|   .env.local #Environment variables file — stores configuration for database URL
|   package.json #Defines project metadata, dependencies, and scripts for the app
|   server.js #Main server entry point — initializes Next.js server and sets up WebSocket or API routes
|               
+---lib
|       mongodb.js #Handles MongoDB connection logic and exports the database client for use across the app
|       
+---models
|       Message.js #Defines the Mongoose schema/model for chat messages
|       
+---pages
|   |   chat.js #Frontend page for the chat interface
|   |   index.js #Login page
|   |   _app.js #Custom Next.js App component
|   |   
|   \---api
|           messages.js #API route for handling message-related requests
|           socket.js #API route for setting up WebSocket or Socket.io connections for real-time chat updates
|           
+---styles
        Chat.module.css #Styles for the chat page
        globals.css #Styles applied across the entire app
        Login.module.css #Styles for the login or landing page
```

### Technologies Used
- **Frontend & Backend**: 
  - **Next.js**: Full-stack JavaScript framework for React.
  - **Node.js**: Backend runtime to handle API routes and real-time messaging logic.
- **Real-Time Communication**:
  - **Socket.io**: WebSocket library for real-time, bidirectional communication.
- **Database**:
  - **MongoDB**: Database used to persist messages and user data.
- **Styling**:
  - **CSS Modules** or **Tailwind CSS** for designing the user interface.

## Learning Outcomes
1. Build full-stack applications using Next.js with pages, API routes, and backend logic.
2. Implement one-to-one real-time messaging using WebSocket (Socket.io).
3. Store messages in a database (MongoDB) to maintain chat history.
4. Display previous messages when a user logs in or opens a chat.
5. Understand user session management and message routing for private communication.

## Contributions

Contribution details of each member is listed in `CONTRIBUTIONS.txt`