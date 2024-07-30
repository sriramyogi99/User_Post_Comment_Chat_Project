const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const chatRoutes = require('./routes/chatRoutes');
const commentRoutes = require('./routes/commentRoutes');
const User = require('./models/User');
//
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
//
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(8080, {
  cors: {
      origin: 'http://localhost:3000',
  }
});
//
dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 8000;

// Socket.io
let users = [];
io.on('connection', socket => {
    console.log('User connected, Socket Id: ', socket.id);
    socket.on('addUser', userId => {
        const isUserExist = users.find(user => user.userId === userId);
        if (!isUserExist) {
            const user = { userId, socketId: socket.id };
            users.push(user);
            io.emit('getUsers', users);
        }
    });

    socket.on('sendMessage', async ({ senderId, receiverId, message, conversationId }) => {
        const receiver = users.find(user => user.userId === receiverId);
        const sender = users.find(user => user.userId === senderId);
        const user = await User.findById(senderId);
        console.log('sender :>> ', sender, receiver);
        if (receiver) {
            io.to(receiver.socketId).to(sender.socketId).emit('getMessage', {
                senderId,
                message,
                conversationId,
                receiverId,
                user
                // user: { id: user._id, username: user.username, email: user.email, profilePic: user.profilePic }
            });
            }else {
                io.to(sender.socketId).emit('getMessage', {
                    senderId,
                    message,
                    conversationId,
                    receiverId,
                    user
                    // user: { id: user._id, username: user.username, email: user.email, profilePic: user.profilePic }
                });
            }
        });

    socket.on('disconnect', () => {
        users = users.filter(user => user.socketId !== socket.id);
        io.emit('getUsers', users);
    });
    // io.emit('getUsers', socket.userId);
});

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
const postUploadDir = path.join(__dirname, 'postUploads');
// const messageUploadDir = path.join(__dirname, 'messageUploads');
//
if (!fs.existsSync(uploadDir)) { fs.mkdirSync(uploadDir); }
if (!fs.existsSync(postUploadDir)) { fs.mkdirSync(postUploadDir); }
// if (!fs.existsSync(messageUploadDir)) { fs.mkdirSync(messageUploads); }

//
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

//Routes
app.get('/', (req, res) => {
    res.send('Welcome');
})
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api', chatRoutes);

// Serve static files from the uploads directory
app.use('/uploads', express.static(uploadDir));
app.use('/postUploads', express.static(postUploadDir));
// app.use('/messageUploads', express.static(messageUploadDir));


// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io }