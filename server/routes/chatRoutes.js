const express = require("express");
const router = express.Router();
const Messages = require("../models/Messages");
const Conversations = require("../models/Conversations");
const User = require("../models/User");
const { io } = require("../server");
//

router.post('/conversation', async (req, res) => {
  try {
      const { senderId, receiverId } = req.body;
      const newCoversation = new Conversations({ members: [senderId, receiverId] });
      await newCoversation.save();
      res.status(200).send('Conversation created successfully');
  } catch (error) {
      console.log(error, 'Error')
  }
})


router.get('/conversations/:userId', async (req, res) => {
  try {
      const userId = req.params.userId;
      const conversations = await Conversations.find({ members: { $in: [userId] } });
      const conversationUserData = Promise.all(conversations.map(async (conversation) => {
          const receiverId = conversation.members.find((member) => member !== userId);
          const user = await User.findById(receiverId);
          return { user: { receiverId: user._id, email: user.email, username: user.username, profilePic: user.profilePic }, conversationId: conversation._id }
      }))
      res.status(200).json(await conversationUserData);
  } catch (error) {
      console.log(error, 'Error')
  }
})


router.post('/message', async (req, res) => {
  try {
      const { conversationId, senderId, message, receiverId = '' } = req.body;
      if (!senderId || !message) return res.status(400).send('Please fill all required fields')
      if (conversationId === 'new' && receiverId) {
          const newCoversation = new Conversations({ members: [senderId, receiverId] });
          await newCoversation.save();
          const newMessage = new Messages({ conversationId: newCoversation._id, senderId, message });
          await newMessage.save();
          return res.status(200).send('Message sent successfully');
      } else if (!conversationId && !receiverId) {
          return res.status(400).send('Please fill all required fields')
      }
      const newMessage = new Messages({ conversationId, senderId, message });
      await newMessage.save();
      res.status(200).send('Message sent successfully');
  } catch (error) {
      console.log(error, 'Error')
  }
})


router.get('/message/:conversationId', async (req, res) => {
  try {
      const checkMessages = async (conversationId) => {
          console.log(conversationId, 'conversationId')
          const messages = await Messages.find({ conversationId });
          const messageUserData = Promise.all(messages.map(async (message) => {
              const user = await User.findById(message.senderId);
              return { user: { id: user._id, email: user.email, username: user.username, profilePic: user.profilePic }, message: message.message }
          }));
          res.status(200).json(await messageUserData);
      }
      const conversationId = req.params.conversationId;
      if (conversationId === 'new') {
          const checkConversation = await Conversations.find({ members: { $all: [req.query.senderId, req.query.receiverId] } });
          if (checkConversation.length > 0) {
              checkMessages(checkConversation[0]._id);
          } else {
              return res.status(200).json([])
          }
      } else {
          checkMessages(conversationId);
      }
  } catch (error) {
      console.log('Error', error)
  }
})


router.get('/allusers/:userId', async (req, res) => {
  try {
      const userId = req.params.userId;
      const users = await User.find({ _id: { $ne: userId } });
      const usersData = Promise.all(users.map(async (user) => {
          return { user: { email: user.email, username: user.username, receiverId: user._id, profilePic: user.profilePic } }
      }))
      res.status(200).json(await usersData);
  } catch (error) {
      console.log('Error', error)
  }
})


module.exports = router;
