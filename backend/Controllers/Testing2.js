require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { MongoClient, GridFSBucket } = require("mongodb");
const { GridFsStorage } = require("multer-gridfs-storage");
const multer = require("multer");
const cors = require("cors");
const bodyParser = require("body-parser");
const userr = require("../models/User");
const Postss = require("../models/Posts");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const authenticateUser = require("../middleware/authenticateUser");
const Profile = require("../models/Profiles");
const Notification=require("../models/NotificationSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.options("*", cors());

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
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
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      allowedHeaders: ['Authorization'],
      credentials: true,
    },
    pingInterval: 10000, 
    pingTimeout: 5000,
    transports: ['websocket'],
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    const userId =socket.handshake.query.userId || socket.userId;
    if (!userId) {
      console.error("No userId provided");
      return;
    }
    socket.broadcast.emit('userOnline', { userId });

    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined room ${userId}`);
    });
   

    socket.on("sendMessage", async (data) => {
      console.log("Inside the send message socket:", data);
      const { sender, receiverId, content, mediaUrl, mediaType, replyTo,post } =
        data;
       
      try {
        console.log("Inside the try block of the socket send messages");
        const newMessage = new Message({
          sender: sender,
          receiver: receiverId,
          content,
          mediaUrl,
          mediaType,
          replyTo: replyTo || null,
          post:post && post._id ? {
            postId: post._id || 'null',  
            caption: post.caption || '',
            imageUrl: post.imageUrl || '', 
          
          } : null
        });
        console.log("before saving messages in the database ");
        
        io.to(receiverId).emit('receiveMessage', newMessage);
        io.to(sender).emit("messageSent", newMessage);
        

        console.log("Saved message and emitted to users.");
        console.log(`Emitting receiveMessage to user: ${receiverId}`, newMessage);
        console.log("after saving messages in the database ");
        let conversation = await Conversation.findOne({
          participants: { $all: [sender, receiverId] },
        });

        if (!conversation) {
          conversation = new Conversation({
            participants: [sender, receiverId],
            latestMessage: newMessage._id,
            updatedAt: new Date(),
            unreadCounts: {
              [receiverId]:1}
          });
        } else {
          conversation.latestMessage = newMessage._id;
          conversation.updatedAt=new Date();
          
          conversation.unreadCounts.set(receiverId, (conversation.unreadCounts.get(receiverId) || 0) + 1);
        }

        await conversation.save();
       
        io.to(sender).emit('updateUserList', { senderId: sender, receiverId });
        io.to(receiverId).emit('updateUserList', { senderId: sender, receiverId });
        
        socket.emit('conversationUpdated', { userId: currentUserId, conversationId: conversation._id });

 
        const notificationData = {
          type: 'message',
          content: '',
          data: newMessage, 
          userId: receiverId,
          relatedId: newMessage._id,
          read: false, 
          createdAt: new Date(),
        };

        
    const newNotification = new Notification(notificationData);
    console.log("before saving the notifications data===>",newNotification)
   
    console.log("after saving the notifications data===>",newNotification)
    io.to(receiverId).emit('notification', newNotification); 
    
       
      
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });
    socket.on("disconnect", (reason) => {
      const userId = socket.userId;
      socket.broadcast.emit('userOffline', { userId });
      console.log("User disconnected:", socket.id, "Reason:", reason);
    });
  });

  const PORT = process.env.PORT || 8001;
  server.listen(PORT, () => {
    console.log("Server running on port 8001 from web socket");
  });

  try {
    mongoose.connect(process.env.MONGODB_URI);
    const conn = mongoose.connection;
    console.log("mongodb connected successfully");

    conn.once("open", async () => {
      console.log("MongoDB connection opened");

      const client = new MongoClient(process.env.MONGODB_URI);

      await client.connect();
      console.log("MongoClient connected");
      const db = client.db();
      gridfsBucket = new GridFSBucket(db, { bucketName: "uploads" });
      console.log("GridFSBucket initialized");

      const storage = new GridFsStorage({
        url: process.env.MONGODB_URI,

    file: (req, file) => {
        const f = {
            bucketName: "uploads",
            filename: `${Date.now()}-${file.originalname}`,
            contentType: file.mimetype,
        };

        if (f && f._id) {
            console.log("File ID:", f._id);
        } else {
            console.error("File object or _id is undefined:", f);
        }

        return f;
    },

        
      });
      const upload = multer({ storage });

      // Fetch conversations for the logged-in user and shuffle based on latest messages
app.get("/api/conversations", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.userId;

   
    const conversations = await Conversation.find({
      participants: { $in: [userId] }
    })
    .populate('latestMessage')  
    .sort({ updatedAt: -1 })    

     
     const formattedConversations = conversations.map(convo => ({
      ...convo.toObject(),
      unreadCounts: convo.unreadCounts.get(userId) || 0
    }));
    res.status(200).json(formattedConversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});


//api for messages sending
      app.post(
        "/api/messages",
        authenticateUser,
        upload.single("file"),
        async (req, res) => {
          console.log("inside the messages route");
          console.log("Request body:", req.body);
          const { post } = req.body;
          console.log("Post data:", post);

          const { receiverId, content, replyTo, postId, postCaption, postImageUrl } = req.body;
          const senderId = req.user.userId;
          const fileUrl = req.file
            ? `${req.protocol}://${req.get("host")}/api/image/${
                req.file.filename
              }`
            : null;
          console.log("receiver id===>", receiverId);

          if (!content && !fileUrl && !postId) {
            return res.status(400).send("Content or media must be provided");
          }

          if (!receiverId || !/^[a-f0-9]{32}$/.test(receiverId)) {
            console.log("Invalid receiverId format:", receiverId);
            return res.status(400).send("Invalid receiverId format");
          }

   
    const isValidUUID = (id) => /^[a-f0-9]{32}$/.test(id);

    if (!isValidUUID(senderId) || !isValidUUID(receiverId)) {
      console.log("Invalid ID format:", senderId, receiverId);
      return res.status(400).send("Invalid ID format");
    }

          try {
            console.log("inside the try block of the messages route");
           
      
    
        
            const newMessage = new Message({
              sender: senderId,
              receiver: receiverId,
              content,
              mediaUrl: fileUrl,
              mediaType: req.file ? req.file.mimetype.split("/")[0] : null,
              timestamp: new Date(),
              replyTo: replyTo || null,
              post:post && post._id ? {
                postId: post._id || 'null', 
                caption: post.caption || '',
                imageUrl: post.imageUrl || '',
              
              } : null
            });

          
            console.log("Post details:", newMessage);
            console.log("before saving messages in the database ");
            console.log("Message here==>more  object before saving:", newMessage);
            await newMessage.save();
            console.log("after saving messages in the database ");

            let conversation = await Conversation.findOne({
              participants: { $all: [senderId, receiverId] },
            });

            if (!conversation) {
              conversation = new Conversation({
                participants: [senderId, receiverId],
                latestMessage: newMessage._id,
                updatedAt: new Date(),
              });
            } else {
              conversation.latestMessage = newMessage._id;
              conversation.updatedAt=new Date();
            }

            console.log("before saving conversation in the database ");
           
            console.log("after saving conversation in the database succesfull");


      
      const sender = await userr.findOne({userId:senderId});
      if (!/^[a-f0-9]{32}$/.test(senderId)) {
        console.log("Invalid receiverId format:", senderId);
        
        return res.status(400).json({ error: "Invalid receiverId format" });
      }
      if (!sender) {
        return res.status(404).json({ error: "Sender not found" });
      }
      const senderFullName = sender.fullName || 'Unknown Sender';
      console.log("here senderFullName==>",senderFullName)
             
             console.log("Post object:", post);
             if (post) {
               console.log("Post postedBy:", post.postedBy);
             }
             
    const newNotification = new Notification({
      userId: receiverId,
      type: 'message',
      content: `You have a new message from ${senderFullName}`,
      data: { messageId: newMessage._id },
      read: false,
    });
    if (!/^[a-f0-9]{32}$/.test(receiverId)) {
      console.log("Invalid receiverId format:", receiverId);
      return res.status(400).json({ error: "Invalid receiverId format" });
    }

    console.log("before saving notification in the database ");

    await newNotification.save();
    console.log("after saving notification in the database ");
            res.status(201).json(newMessage);
          } catch (error) {
            console.error("Error sending message:", error);
            res.status(500).send("Error sending message");
          }
        }
      );

    // Mark all messages as read when user views a conversation
    app.put('/api/conversations/:userId/markAsRead', authenticateUser, async (req, res) => {
      try {
        console.log("inside the try block of the /api/conversations/:userId/markAsRead");
        const { userId } = req.params;  
        const currentUserId = req.user.userId;  
    
        console.log("before updating in database /api/conversations/:userId/markAsRead");
    
        
        const updatedMessages = await Message.updateMany(
          {
            sender: userId,
            receiver: currentUserId,
            read: false
          },
          { read: true }
        );
        console.log(`Marking messages as read where sender: ${userId}, receiver: ${currentUserId}, read: false`);
    
        console.log(`Messages matched: ${updatedMessages.matchedCount}, Messages modified: ${updatedMessages.modifiedCount}`);
        console.log("after updating in database /api/conversations/:userId/markAsRead");
    
      
        const conversation = await Conversation.findOne({
          participants: { $all: [currentUserId, userId] } 
        });
    
        if (conversation) {
         
          if (typeof conversation.unreadCounts === 'object') {
            conversation.unreadCounts[currentUserId] = 0; 
          } else if (conversation.unreadCounts instanceof Map) {
            conversation.unreadCounts.set(currentUserId, 0);  
          }
          await conversation.save();
        }
    
        res.sendStatus(200);
      } catch (error) {
        console.error('Failed to mark messages as read:', error);
        res.status(500).json({ error: 'Failed to mark messages as read' });
      }
    });

    //api for notifications find 
      app.get("/api/notifications", authenticateUser, async (req, res) => {
        console.log("inside the /api/notifications")
        const userId = req.user.userId; 
        try {
          console.log("inside try block of  the /api/notifications")
          const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
          res.json(notifications);
        } catch (error) { 
          res.status(500).json({ error: "Failed to fetch notifications" });
        }
      });

      //api for notification to insert in to the databse
      app.post("/api/notifications", authenticateUser, async (req, res) => {
        const { type, content, data } = req.body;  
        const userId = req.user.userId; 
      
        try {
          const newNotification = new Notification({
            userId,
            type,
            content,
            data,
            read: false,
          });      
          await newNotification.save();
          res.status(201).json({ message: "Notification created", notification: newNotification });
        } catch (error) {
          console.error("Failed to create notification:", error);  
          res.status(500).json({ error: "Failed to create notification" });
        }
      });
      

      //api for notification search for loggedin users
      app.put("/api/notifications/:id/read", authenticateUser, async (req, res) => {
        const notificationId = req.params.id;
        try {
         
          const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, userId: req.user.userId },
            { read: true },
            { new: true }
          );
      
          if (!notification) {
            return res.status(404).json({ error: "Notification not found or not authorized" });
          }
      
          res.json({ message: "Notification marked as read", notification });
        } catch (error) {
          console.error("Failed to mark notification as read:", error);
          res.status(500).json({ error: "Failed to mark notification as read" });
        }
      });
      
      

      //api for upload the file and saving in database as url
      app.post(
        "/api/upload",
        authenticateUser,
        upload.single("file"),
        async (req, res) => {
          console.log("File upload request received");
          if (!req.file) {
            console.error("No file received");
            return res.status(400).json({ error: "No file received" });
          }
          console.log("Uploaded file:", req.file);
          const { userId, caption } = req.body;
          const newPost = new Postss({
            user: userId,
            caption,
            imageUrl: `image/${req.file.filename}`,
            date: new Date(),
          });
          try {
            console.log("inside try block of the upload post");
            const savedPost = await newPost.save();
            res.json(savedPost);
            console.log("before io savedpost");
            io.emit("newPost", savedPost);
            console.log("after io savedpost");
          } catch (err) {
            console.error("Error saving post:", err);
            res.status(500).send(err);
          }
        }
      );

      //api for finding the user name for profile
      app.put('/api/users/:userId/fullName', authenticateUser, async (req, res) => {
        const { userId } = req.params;
        const { fullName } = req.body;
      
        if (!fullName) {
          return res.status(400).json({ error: 'fullName is required' });
        }
      
        try {
          const user = await userr.findOne({ userId: userId });
      
          if (!user) {
            return res.status(404).json({ error: 'User not found' });
          }
      
          user.fullName = fullName;
          await user.save();
      
          res.status(200).json({ message: 'fullName updated successfully', fullName: user.fullName });
        } catch (error) {
          console.error('Error updating fullName:', error);
          res.status(500).json({ error: 'Server error' });
        }
      });

      //api for Update user profile
      app.put(
        "/api/profile/:userId",
        authenticateUser,
        upload.single("ProfileImageURL"),
        async (req, res) => {
          console.log("inisde the /profile/${userId} route");
          const { userId } = req.params;
          const { Bio, Gender, Name } = req.body;
          const ProfileImageURL = req.file
            ? `image/${req.file.filename}`
            : null;

     
          if (!/^[a-f0-9]{32}$/.test(userId)) {
            console.log("Invalid userId format:", userId);
            return res.status(400).json({ error: "Invalid userId format" });
          }

          try {
            
            console.log("inisde try block of the /profile/${userId} route");
            const profile = await Profile.findOne({ userId });

            if (!profile) {
              console.log("Profile not found for userId:", userId);
              return res.status(404).json({ error: "Profile not found" });
            }

   
            if (Name) profile.Name = Name;
            if (Bio) profile.Bio = Bio;
            if (Gender) profile.Gender = Gender;
            if (ProfileImageURL) profile.ProfileImageURL = ProfileImageURL;

            console.log(
              "inisde the /profile/${userId} before saving in database"
            );
            await profile.save();
            console.log(
              "inisde the /profile/${userId} after saving in database"
            );

            res.status(200).json(profile);
          } catch (error) {
            console.error("Error updating profile:", error);
            res.status(500).json({ error: "Server error" });
          }
        }
      );

      //api for user profile creation time
      app.post(
        "/api/profile",
        authenticateUser,
        upload.single("ProfileImageURL"),
        async (req, res) => {
          console.log("inside the /api/profile ==>here shekar correct");
          const { Bio, Gender, userId } = req.body; // Extract userId from the request body
          const ProfileImageURL = `image/${req.file.filename}`;
          try {
            console.log("inside the try /api/profile");
            const newProfile = new Profile({
              Bio,
              Gender,
              ProfileImageURL,
              userId, 
            });

            await newProfile.save();
            res.status(201).json(newProfile);
          } catch (error) {
            console.error("Error creating profile:", error);
            res.status(500).json({ error: "Server error" });
          }
        }
      );

      app.get("/api/profile/check/:userId", async (req, res) => {
        console.log("inside the /api/profile/check/:userId");
        const { userId } = req.params;

        if (!/^[a-f0-9]{32}$/.test(userId)) {
          console.log("Invalid userId format:", userId);
          return res.status(400).send("Invalid userId format");
        }

        try {
          console.log("inisde the try of /api/profile/check/:userId");
          const profile = await Profile.findOne({ userId });
          console.log("after getting profile details here", profile);
          if (profile) {
            console.log(
              " in if block after getting profile details here",
              profile
            );
            return res.json({
              exists: true,
              profileId: profile._id,
              ProfileImageURL: profile.ProfileImageURL,
            });
          } else {
            console.log(
              " in else block after getting profile details here",
              profile
            );
            return res.json({ exists: false });
          }
        } catch (error) {
          console.error("Error checking profile:", error);
          res.status(500).json({ error: "Server error" });
        }
      });

      //api for login time
      app.post("/api/Login", async (req, res) => {
        const { username, password } = req.body;
        console.log("inside the login")

        try {
          const user = await userr.findOne({ username });
          if (user && (await bcrypt.compare(password, user.password))) {
            console.log("inside the login1")
            const token = jwt.sign(
              { userId: user.userId },
              process.env.JWT_SECRET,
              { expiresIn: "20m" }
            );
            
          console.log("inside the login3")

            user.tokens = user.tokens || [];
            user.tokens.push({ token });
            await user.save();
            console.log("inside the login4 after")
            return res.status(200).send({ user, token });
          } else {
            return res
              .status(401)
              .json({ message: "Invalid username or password" });
          }
        } catch (e) {
          console.error("Error during login:", e);
          res.status(500).json({ message: "Server error" });
        }
      });
      

      //api for sign up time
      app.post("/api/Signup", async (req, res) => {
        const { fullName, username, password, userId, createdAt } = req.body;
        const salt = 10;
        const hashPassword = await bcrypt.hash(password, salt);
        const data = new userr({
          fullName,
          username,
          password: hashPassword,
          userId,
          createdAt,
        });

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

      app.use("/api/users", authenticateUser);
      app.use("/api/upload", authenticateUser);
      app.use("/api/posts", authenticateUser);
      app.use("/api/users/:id", authenticateUser);

      //api for to get the all the userlist
      app.get("/api/users", async (req, res) => {
        try {
          const users = await userr.find({}, "fullName userId");
          res.status(200).json(users);
          
        } catch (error) {
          res.status(500).json({ error: "Failed to fetch users" });
        }
      });

      app.get("/api/users/:userid", async (req, res) => {
        const userId = req.params.userid;

        try {
          const user = await userr.findOne({ userId: userId });
          if (user) {
            res.json(user);
          } else {
            res.status(404).send({ message: "User not found" });
          }
        } catch (error) {
          res.status(500).json({ error: "Failed to fetch user" });
        }
      });

    

      //api for files saving in database for all req types using the gridfsbuckets
      app.get("/api/image/:filename", async (req, res) => {
        console.log(`Received request to fetch image: ${req.params.filename}`);
        if (!gridfsBucket) {
          console.error("GridFSBucket not initialized");
          return res.status(500).json({ err: "GridFSBucket not initialized" });
        }

        try {
          const filesCursor = gridfsBucket.find({
            filename: req.params.filename,
          });
          const files = await filesCursor.toArray();

          if (!files || files.length === 0) {
            console.log(
              "No file exists with the name:"`${req.params.filename}`
            );
            return res.status(404).json({ err: "No file exists" });
          }

          const file = files[0];
          if (
            file.contentType === "image/jpeg" ||
            file.contentType === "image/webp" ||
            file.contentType === "image/png" ||
            file.contentType === "video/mp4" ||
            file.contentType === "audio/webm" || 
            file.contentType === "audio/mpeg" // 
          ) {
            res.set("Content-Type", file.contentType);
            res.set("Cache-Control", "no-store");
            res.set("Accept-Ranges", "bytes");

            const readstream = gridfsBucket.openDownloadStreamByName(
              req.params.filename
            );
            readstream.on("error", (err) => {
              res.status(500).json({ err: "Error reading file" });
            });
            readstream.pipe(res);
          } else {
            console.log(
              `Not a supported media type for file: ${req.params.filename}`
            );
            res.status(404).json({ err: "Not a supported media type" });
          }
        } catch (error) {
          console.error("Unexpected error occurred:", error);
          res.status(500).json({ err: "Unexpected error occurred" });
        }
      });

      //api for getting all the posts of users
      app.get("/api/posts", async (req, res) => {
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
            user: {
              username: userMap[post.user].username,
              fullName: userMap[post.user].fullName,
            },
          }));

          console.log("Posts with user data:", postsWithUser);
          res.json(postsWithUser);
        } catch (err) {
          console.error("Error fetching posts:", err);
          res.status(500).send(err);
        }
      });

      //api for liking the post and unlikig the post and notification to owner for that post
      app.post("/api/posts/:id/like", async (req, res) => {
        const postId = req.params.id;
        const userId = req.user.userId; 
      
        try {
          
          const post = await Postss.findById(postId);
          if (!post) {
            return res.status(404).send({ message: "Post not found" });
          }
      
         
          const hasLiked = post.likedBy.includes(userId);
      
          if (hasLiked) {
           
            post.likes -= 1;
            post.likedBy.pull(userId);
          } else {
           
            post.likes += 1;
            post.likedBy.push(userId);
          }
      
          await post.save();
      
         
          const liker = await userr.findOne({ userId: userId });
          if (!liker) {
            return res.status(404).json({ error: "User not found" });
          }
          const likerFullName = liker.fullName || 'Unknown User';
      
       
          if (!post.user) {
            console.error("Error: Post ownerId is missing.");
            return res.status(500).json({ error: "Post ownerId is missing." });
          }
      
         
          const newNotification = new Notification({
            userId: post.user, 
            type: 'like',
            content: `${likerFullName} liked your post.`,
            data: { postId: post._id },
            read: false,
          });
      
          console.log("before saving notification in the database in post likes");
      
          await newNotification.save();
          console.log("after saving notification in the database in post likes");
      
          res.json({ likes: post.likes, liked: !hasLiked });
        } catch (err) {
          console.error("Error liking post:", err);
          res.status(500).send(err);
        }
      });
      

      //api for search bar for user can search any user
      app.get("/api/search", authenticateUser, async (req, res) => {
        const { query } = req.query;
        console.log("inside the search route");

        if (!query) {
          return res.status(400).json({ error: "Query parameter is required" });
        }

        try {
          console.log("inside try of the search route");
          const users = await userr.find(
            {
              fullName: { $regex: query, $options: "i" },
            },
            "fullName userId"
          );

          res.status(200).json(users);
        } catch (error) {
          console.error("Error fetching search results:", error); // Log the error for debugging
          res.status(500).json({ error: "Failed to fetch search results" });
        }
      });

      //api for logout
      app.post("/api/logout", authenticateUser, async (req, res) => {
        try {
          const user = req.user; 
          const token = req.token; 

          if (user) {
         
            user.tokens = user.tokens.filter((t) => t.token !== token);
            await user.save(); 

            res.status(200).json("Logout successful");
          } else {
            res.status(404).json("User not found");
          }
        } catch (err) {
          console.error("Error during logout:", err);
          res.status(500).json("Server error");
        }
      });
    });
  } catch (e) {
    console.log(e);
  }
};

//api for messages received 
app.get("/api/messages/:receiverId", authenticateUser, async (req, res) => {
  console.log("inside the messages/reciverid");
  const { receiverId } = req.params;
  const userId = req.user.userId; 

  console.log("Received receiverId:", receiverId);
  console.log("Current userId:", userId);

  
  if (!/^[a-f0-9]{32}$/.test(userId)) {
    console.log("Invalid userId format:", userId.receiverid);
    return res.status(400).send("Invalid userId format");
  }

  if (!/^[a-f0-9]{32}$/.test(receiverId)) {
    console.log("Invalid receiverId format:", receiverId);
    return res.status(400).send("Invalid receiverId format");
  }

  try {
    console.log("inisde the triy block of message.receiverid");
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: receiverId },
        { sender: receiverId, receiver: userId },
      ],
    }).sort({ timestamp: 1 });

    res.json(messages);
    console.log(
      "inside the triy block of message.receiverid after sending the json data"
    );
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).send("Error fetching messages");
  }
});

//api to handle fetching a profile by ID
app.get("/api/profile/:userId", authenticateUser, async (req, res) => {
  const { userId } = req.params;
  console.log("Received userId in request:", userId);

  try {
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      console.log("Profile not found");
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Server error" });
  }
});

connectToDatabase();
