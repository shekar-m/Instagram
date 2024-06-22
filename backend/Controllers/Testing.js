require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { MongoClient, GridFSBucket } = require("mongodb");
const { GridFsStorage } = require("multer-gridfs-storage");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const userr = require("../models/User");
const Postss = require("../models/Posts");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const authenticateUser = require('../middleware/authenticateUser'); // Import middleware
const ObjectId = mongoose.Types.ObjectId;
const bcrypt=require('bcrypt');
const jwt = require('jsonwebtoken');
const { useInRouterContext } = require("react-router-dom");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.options("*", cors());


app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type","Authorization"],
    credentials: true,
  })
);

let gridfsBucket;
mongoose.set("strictQuery", false);

const connectToDatabase = async () => {
  const http = require("http");
  const socketIO = require("socket.io");

  const server = http.createServer(app);

  const io = socketIO(server, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined room ${userId}`);
    });

    socket.on("sendMessage", async (data) => {
      const { senderId, receiverId, content, mediaUrl } = data;

      try {
        const newMessage = new Message({
          sender: senderId,
          receiver: receiverId,
          content,
          mediaUrl,
        });
        await newMessage.save();

        let conversation = await Conversation.findOne({
          participants: { $all: [senderId, receiverId] },
        });

        if (!conversation) {
          conversation = new Conversation({
            participants: [senderId, receiverId],
            latestMessage: newMessage._id,
          });
        } else {
          conversation.latestMessage = newMessage._id;
        }

        await conversation.save();

        io.to(receiverId).emit("receiveMessage", newMessage);
        io.to(senderId).emit("messageSent", newMessage);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  const PORT = process.env.PORT || 8001;
  server.listen(PORT, () => {
    console.log("Server running on port 8001 from web socket");
  });

  try {
    mongoose.connect(
      "mongodb+srv://Admin:Shekar3999@Cluster1.rnlp84v.mongodb.net/",
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
    const conn = mongoose.connection;
    console.log("mongodb connected successfully");

    conn.once("open", async () => {
      console.log("MongoDB connection opened");

      const client = new MongoClient(
        "mongodb+srv://Admin:Shekar3999@Cluster1.rnlp84v.mongodb.net/",
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }
      );

      await client.connect();
      console.log("MongoClient connected");
      const db = client.db();
      gridfsBucket = new GridFSBucket(db, { bucketName: "uploads" });
      console.log("GridFSBucket initialized");

      const storage = new GridFsStorage({
        url: "mongodb+srv://Admin:Shekar3999@Cluster1.rnlp84v.mongodb.net/",
        options: { useNewUrlParser: true, useUnifiedTopology: true },
        file: (req, file) => {
          return {
            bucketName: "uploads",
            filename: `${Date.now()}-${file.originalname}`,
            contentType: file.mimetype,
          };
        },
      });
      const upload = multer({ storage });

      app.get("/", (req, res) => {
        res.send("App is Working");
      });

      app.post("/Login", async (req, res) => {
        const { username, password } = req.body;
      
        try {
          const user = await userr.findOne({ username });
          if (user && await bcrypt.compare(password, user.password)) {
            // Generate JWT token
            const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
      
            // Ensure tokens field is an array
            user.tokens = user.tokens || [];
            // Save token to the user's tokens array in the database
            user.tokens.push({ token });
            await user.save();
            res.send({ user, token });
          } else {
            res.status(401).json("Invalid username or password");
          }
        } catch (e) {
          console.error("Error during login:", e);
          res.status(500).json("Server error");
        }
      });
      

      app.post("/Signup",async (req, res) => {
        console.log("inside the signup")
        const { username, password, userId, createdAt } = req.body;
        const salt=10;
        console.log("before hashhing")  
        const hashPassword=await bcrypt.hash(password,salt)
        console.log("after hashhing")
        const data = new userr({username:username,password:hashPassword,userId:userId,createdAt:createdAt});
        try {
          console.log("inside the try block")
          console.log("checking  in before server")
          const existingUser = await userr.findOne({ username });
          console.log("checking  in before server")
          if (existingUser) {
            console.log("exister user in bakend server")
            res.json("exist");
          } else {
            console.log("in else block")

            await userr.insertMany([data]);
            console.log("inserting here successfully")
            res.json("not exist");
          }
        } catch (e) {
          res.json("catch error");
        }
      });

      // Apply the middleware to all routes that require authentication
      // app.use(authenticateUser);
    app.use('/users', authenticateUser);
    app.use('/upload', authenticateUser);
    app.use('/posts',authenticateUser);
    // app.use('/image/:filename', authenticateUser);
    // app.use('/send-message', authenticateUser);
    // app.use('/conversations', authenticateUser);
    // app.use('/messages', authenticateUser);
    
      app.get("/users", async (req, res) => {
        try {
          const users = await userr.find({}, 'username userId');
          res.status(200).json(users);
        } catch (error) {
          res.status(500).json({ error: "Failed to fetch users" });
        }
      });

      app.use("/image", express.static(path.join(__dirname, "..", "image")));

      app.post("/upload", upload.single("file"), async (req, res) => {
        if (!req.file) {
          return res.status(400).json({ error: "No file received" });
        }

        const date = new Date();
        const { userId, caption } = req.body;
        const newPost = new Postss({
          user: userId,
          caption,
          imageUrl: `image/${req.file.filename}`,
          date,
        });

        try {
          const savedPost = await newPost.save();
          res.json(savedPost);
        } catch (err) {
          res.status(500).send(err);
        }
      });

      app.get("/image/:filename", async (req, res) => {
        console.log(`Received request to fetch image: ${req.params.filename}`);
        if (!gridfsBucket) {
          console.error("GridFSBucket not initialized");
          return res.status(500).json({ err: "GridFSBucket not initialized" });
        }

        try {
          const filesCursor = gridfsBucket.find({ filename: req.params.filename });
          const files = await filesCursor.toArray();

          if (!files || files.length === 0) {
            console.log(`No file exists with the name: ${req.params.filename}`);
            return res.status(404).json({ err: "No file exists" });
          }

          const file = files[0];
          if (file.contentType === "image/jpeg" || file.contentType === "image/png"|| file.contentType === "video/mp4") {
            res.set("Content-Type", file.contentType);
            res.set("Cache-Control", "no-store");
            res.set("Accept-Ranges", "bytes");

            const readstream = gridfsBucket.openDownloadStreamByName(req.params.filename);
            readstream.on("error", (err) => {
              res.status(500).json({ err: "Error reading file" });
            });
            readstream.pipe(res);
          } else {
            console.log(`Not a supported media type for file: ${req.params.filename}`);
            res.status(404).json({ err: "Not a supported media type"  });
          }
        } catch (error) {
          console.error("Unexpected error occurred:", error);
          res.status(500).json({ err: "Unexpected error occurred" });
        }
      });

      app.get("/posts", async (req, res) => {
        console.log("Received request to /posts");
        try {
          const posts = await Postss.find();
          const userIds = posts.map((post) => post.user);
          const users = await userr.find({ userId: { $in: userIds } });
          const userMap = users.reduce((map, user) => {
            map[user.userId] = user;
            return map;
          }, {});
      
          const postsWithUser = posts.map((post) => ({
            ...post._doc,
            user: userMap[post.user],
          }));
      
          console.log("Posts with user data:", postsWithUser);
          res.json(postsWithUser);
        } catch (err) {
          console.error("Error fetching posts:", err);
          res.status(500).send(err);
        }
      });

      app.get("/search", async (req, res) => {
        const { query } = req.query;
      
        if (!query) {
          return res.status(400).json({ error: "Query parameter is required" });
        }
      
        try {
          const users = await userr.find({
            username: { $regex: query, $options: "i" }
          }, 'username userId');
      
          res.status(200).json(users);
        } catch (error) {
          console.error("Error fetching search results:", error);
          res.status(500).json({ error: "Failed to fetch search results" });
        }
      });
      

      app.post("/send-message", async (req, res) => {
        const { receiverId, content, mediaUrl } = req.body;
        const senderId = req.headers['x-user-id']; // Assuming user ID is sent in this header
      
        if (!senderId) {
          return res.status(400).json({ error: "Sender ID is required" });
        }
      
        try {
          const newMessage = new Message({
            sender: senderId,
            receiver: receiverId,
            content,
            mediaUrl,
          });
          await newMessage.save();
      
          let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
          });
      
          if (!conversation) {
            conversation = new Conversation({
              participants: [senderId, receiverId],
              latestMessage: newMessage._id,
            });
          } else {
            conversation.latestMessage = newMessage._id;
          }
      
          await conversation.save();
      
          res.status(200).json(newMessage);
        } catch (error) {
          res.status(500).json({ error: "Failed to send message" });
        }
      });

      app.get('/conversations/:userId', async (req, res) => {
        try {
          const userId = req.params.userId;
      
          // Validate if userId is a valid ObjectId
          if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid user ID format' });
          }
      
          const objectId = new ObjectId(userId);
      
          const conversations = await Conversation.find({
            participants: objectId
          }).populate('participants').populate('latestMessage');
      
          res.status(200).json(conversations);
        } catch (error) {
          console.error('Failed to fetch conversations:', error);
          res.status(500).json({ error: 'Failed to fetch conversations' });
        }
      });
      app.get("/messages/:conversationId", async (req, res) => {
        const { conversationId } = req.params;

        try {
          const messages = await Message.find({
            conversation: conversationId,
          }).sort({ createdAt: 1 });

          res.status(200).json(messages);
        } catch (error) {
          res.status(500).json({ error: "Failed to fetch messages" });
        }
      });

    });
  } catch (err) {
    console.error(err);
  }
};

connectToDatabase();
