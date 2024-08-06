const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Messages = require('../models/Messages');
const Conversations = require('../models/Conversations');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// register route
router.post('/register', upload.single('profilePic'), async (req, res) => {
  const { username, email, password } = req.body;
  const profilePic = req.file ? `/uploads/${req.file.filename}` : '/uploads/defaultProfile.png';

  const usernameExists = await User.findOne({username: username});
  const emailExists = await User.findOne({email: email});

  if(usernameExists){
    return res.status(400).json({ message: 'Username already exists' });
  }

  if(emailExists){
    return res.status(400).json({ message: 'Email already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    username,
    email,
    password: hashedPassword,
    profilePic,
  });

  await user.save();

  res.status(201).json({ message: 'User registered successfully' });
});

// login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user by username or email
    const user = await User.findOne({ 
      $or: [
        { email: username },
        { username: username }
      ]
    });

    if (!user) {
      // User not found
      return res.status(401).json({ message: 'Invalid username or email' });
    }

    // Check if password matches
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      // Incorrect password
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: 84600 });

    // Send response
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
      token,
    });

  } catch (error) {
    // Handle unexpected errors
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// update a user
router.put('/:id', upload.single('profilePic'), async (req, res) => {
  const { id } = req.params;
  const { username, email } = req.body;
  const newProfilePic = req.file ? `/uploads/${req.file.filename}` : undefined;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send('User not found');
    }

    const usernameExists = await User.findOne({ username });
    const emailExists = await User.findOne({ email });

    if (usernameExists && usernameExists._id.toString() !== id) {
      return res.status(400).json({ message: 'Username already exists. Choose another one!' });
    }

    if (emailExists && emailExists._id.toString() !== id) {
      return res.status(400).json({ message: 'Email already exists. Choose another one!' });
    }

    user.username = username || user.username;
    user.email = email || user.email;
    if (newProfilePic) {
      user.profilePic = newProfilePic;
    }

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Delete User route
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    await Post.deleteMany({ postCreatedBy: userId });
    await Comment.deleteMany({ commentCreatedBy: userId })

    // Delete conversations and messages involving user
    const conversations = await Conversations.find({ members: userId });
    for (const conversation of conversations) {
        await Messages.deleteMany({ conversationId: conversation._id });
    }
    await Conversations.deleteMany({ members: userId });

    //
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User and all associated posts deleted successfully' });
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Get all users
router.get('/allusers', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get a user details by Id
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found with this ID' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user details', error });
  }
});

// Forgot Password Route
router.post('/forgot-password', async(req, res) => {
  const { email } = req.body;
  User.findOne({ email: email })
  .then(user => {
    if(!user){
      return res.send({ Status: "User not existed" })
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    //
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'ayanakoji106@gmail.com',
        pass: process.env.PASSWORD
      }
    });
    
    var mailOptions = {
      from: 'ayanakoji106@gmail.com',
      to: email,
      subject: 'Reset your Password',
      text: `This is Password reset email. Valid only for 1 hour!
              http://localhost:3000/reset-password/${user._id}/${token}`
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        return res.send({ Status: "Success" });
      }
    });
  })
});

// Reset Password Route
router.post('/reset-password/:id/:token', async(req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;
  //
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(err){
      return res.json({ Status: "Error with token" });
    }else{
      bcrypt.hash(password, 10)
      .then(hashedPassword => {
        User.findByIdAndUpdate({ _id: id }, { password: hashedPassword })
        .then(u => res.send({ Status: "Success" }))
        .catch(err => res.send({ Status: err }))
      })
      .catch(err => res.send({ Status: err }))
    }
  });
});



module.exports = router;
