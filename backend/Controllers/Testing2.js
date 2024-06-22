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
    allowedHeaders: ["Content-Type"],
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
          const user = await userr.findOne({ username, password });
          if (user) {
            res.send({ user });
          } else {
            res.json("notexist");
          }
        } catch (e) {
          res.json("catch error");
        }
      });

      app.post("/Signup", async (req, res) => {
        const { username, password, userId, createdAt } = req.body;
        const data = { username, password, userId, createdAt };
        try {
          const existingUser = await userr.findOne({ username });
          if (existingUser) {
            res.json("exist");
          } else {
            await userr.insertMany([data]);
            res.json("not exist");
          }
        } catch (e) {
          res.json("catch error");
        }
      });

      // Apply the middleware to all routes that require authentication
      // app.use(authenticateUser);

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
        if (!gridfsBucket) {
          console.error("GridFSBucket not initialized");
          return res.status(500).json({ err: "GridFSBucket not initialized" });
        }

        try {
          const filesCursor = gridfsBucket.find({ filename: req.params.filename });
          const files = await filesCursor.toArray();

          if (!files || files.length === 0) {
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
            res.status(404).json({ err: "Not a supported media type"  });
          }
        } catch (error) {
          res.status(500).json({ err: "Unexpected error occurred" });
        }
      });

      app.get("/posts", async (req, res) => {
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

          res.json(postsWithUser);
        } catch (err) {
          res.status(500).send(err);
        }
      });

      app.post("/send-message", async (req, res) => {
        const { receiverId, content, mediaUrl } = req.body;
        const senderId = req.user._id;

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

      app.get("/conversations", async (req, res) => {
        const userId = req.user._id;//STOPPING HERE SHEkAR CAREFULL

        try {
          const conversations = await Conversation.find({
            participants: userId,
          }).populate('latestMessage').exec();

          res.status(200).json(conversations);
        } catch (error) {
          res.status(500).json({ error: "Failed to fetch conversations" });
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
