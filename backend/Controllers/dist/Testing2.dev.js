"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _templateObject() {
  var data = _taggedTemplateLiteral(["", ""]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

require("dotenv").config();

var express = require("express");

var mongoose = require("mongoose");

var _require = require("mongodb"),
    MongoClient = _require.MongoClient,
    GridFSBucket = _require.GridFSBucket;

var _require2 = require("multer-gridfs-storage"),
    GridFsStorage = _require2.GridFsStorage;

var multer = require("multer");

var path = require("path");

var cors = require("cors");

var bodyParser = require("body-parser");

var userr = require("../models/User");

var Postss = require("../models/Posts");

var Message = require("../models/Message");

var Conversation = require("../models/Conversation");

var authenticateUser = require("../middleware/authenticateUser");

var Profile = require("../models/Profiles");

var Notification = require("../models/NotificationSchema");

var ObjectId = mongoose.Types.ObjectId;

var bcrypt = require("bcrypt");

var jwt = require("jsonwebtoken");

var app = express();
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.options("*", cors());
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
var gridfsBucket;
mongoose.set("strictQuery", false);

var connectToDatabase = function connectToDatabase() {
  var http, socketIO, server, io, PORT, conn;
  return regeneratorRuntime.async(function connectToDatabase$(_context21) {
    while (1) {
      switch (_context21.prev = _context21.next) {
        case 0:
          http = require("http");
          socketIO = require("socket.io");
          server = http.createServer(app);
          io = socketIO(server, {
            cors: {
              origin: "http://localhost:3000",
              methods: ["GET", "POST"],
              credentials: true
            }
          });
          io.on("connection", function (socket) {
            console.log("User connected:", socket.id);
            var userId = socket.handshake.query.userId || socket.userId; // Ensure that you are setting userId on the socket connection

            if (!userId) {
              console.error("No userId provided");
              return;
            }

            socket.broadcast.emit('userOnline', {
              userId: userId
            });
            socket.on("join", function (userId) {
              socket.join(userId);
              console.log("User ".concat(userId, " joined room ").concat(userId));
            });
            socket.on("sendMessage", function _callee(data) {
              var senderId, receiverId, content, mediaUrl, mediaType, replyTo, newMessage, conversation, notificationData, newNotification;
              return regeneratorRuntime.async(function _callee$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      console.log("Inside the send message socket:", data);
                      senderId = data.senderId, receiverId = data.receiverId, content = data.content, mediaUrl = data.mediaUrl, mediaType = data.mediaType, replyTo = data.replyTo;
                      _context.prev = 2;
                      console.log("Inside the try block of the socket send messages");
                      newMessage = new Message({
                        sender: senderId,
                        receiver: receiverId,
                        content: content,
                        mediaUrl: mediaUrl,
                        mediaType: mediaType,
                        replyTo: replyTo || null
                      });
                      console.log("before saving messages in the database ");
                      _context.next = 8;
                      return regeneratorRuntime.awrap(newMessage.save());

                    case 8:
                      console.log("after saving messages in the database ");
                      _context.next = 11;
                      return regeneratorRuntime.awrap(Conversation.findOne({
                        participants: {
                          $all: [senderId, receiverId]
                        }
                      }));

                    case 11:
                      conversation = _context.sent;

                      if (!conversation) {
                        conversation = new Conversation({
                          participants: [senderId, receiverId],
                          latestMessage: newMessage._id
                        });
                      } else {
                        conversation.latestMessage = newMessage._id;
                      }

                      _context.next = 15;
                      return regeneratorRuntime.awrap(conversation.save());

                    case 15:
                      notificationData = {
                        type: 'message',
                        content: 'You have a new message',
                        data: newMessage,
                        // or post details, etc.
                        userId: receiverId,
                        relatedId: newMessage._id,
                        read: false,
                        // Ensure the notification is marked as unread
                        createdAt: new Date()
                      }; // Save notification in the database

                      newNotification = new Notification(notificationData);
                      console.log("before saving the notifications data===>", newNotification);
                      _context.next = 20;
                      return regeneratorRuntime.awrap(newNotification.save());

                    case 20:
                      console.log("after saving the notifications data===>", newNotification);
                      io.to(receiverId).emit('notification', newNotification); // Send the notification to the receiver

                      io.to(senderId).emit("messageSent", newMessage);
                      _context.next = 28;
                      break;

                    case 25:
                      _context.prev = 25;
                      _context.t0 = _context["catch"](2);
                      console.error("Error sending message:", _context.t0);

                    case 28:
                    case "end":
                      return _context.stop();
                  }
                }
              }, null, null, [[2, 25]]);
            });
            socket.on("disconnect", function (reason) {
              var userId = socket.userId; // Ensure that you are setting userId on the socket connection

              socket.broadcast.emit('userOffline', {
                userId: userId
              });
              console.log("User disconnected:", socket.id, "Reason:", reason);
            });
          });
          PORT = process.env.PORT || 8001;
          server.listen(PORT, function () {
            console.log("Server running on port 8001 from web socket");
          });

          try {
            mongoose.connect(process.env.MONGODB_URI);
            conn = mongoose.connection;
            console.log("mongodb connected successfully");
            conn.once("open", function _callee20() {
              var client, db, storage, upload;
              return regeneratorRuntime.async(function _callee20$(_context20) {
                while (1) {
                  switch (_context20.prev = _context20.next) {
                    case 0:
                      console.log("MongoDB connection opened");
                      client = new MongoClient(process.env.MONGODB_URI, {// useNewUrlParser: true,
                        // useUnifiedTopology: true,
                      });
                      _context20.next = 4;
                      return regeneratorRuntime.awrap(client.connect());

                    case 4:
                      console.log("MongoClient connected");
                      db = client.db();
                      gridfsBucket = new GridFSBucket(db, {
                        bucketName: "uploads"
                      });
                      console.log("GridFSBucket initialized");
                      storage = new GridFsStorage({
                        url: process.env.MONGODB_URI,
                        file: function file(req, _file) {
                          var f = {
                            bucketName: "uploads",
                            filename: "".concat(Date.now(), "-").concat(_file.originalname),
                            contentType: _file.mimetype
                          };

                          if (f && f._id) {
                            console.log("File ID:", f._id);
                          } else {
                            console.error("File object or _id is undefined:", f);
                          }

                          return f;
                        } // url: process.env.MONGODB_URI,
                        // file: (req, file) => {
                        //   return {
                        //     bucketName: "uploads",
                        //     filename: `${Date.now()}-${file.originalname}`,
                        //     contentType: file.mimetype,
                        //   };
                        // },

                      });
                      upload = multer({
                        storage: storage
                      });
                      app.post("/api/messages", authenticateUser, upload.single("file"), function _callee2(req, res) {
                        var post, _req$body, receiverId, content, replyTo, postId, postCaption, postImageUrl, senderId, fileUrl, isValidUUID, newMessage, conversation, sender, senderFullName, newNotification;

                        return regeneratorRuntime.async(function _callee2$(_context2) {
                          while (1) {
                            switch (_context2.prev = _context2.next) {
                              case 0:
                                console.log("inside the messages route");
                                console.log("Request body:", req.body);
                                post = req.body.post;
                                console.log("Post data:", post);
                                _req$body = req.body, receiverId = _req$body.receiverId, content = _req$body.content, replyTo = _req$body.replyTo, postId = _req$body.postId, postCaption = _req$body.postCaption, postImageUrl = _req$body.postImageUrl;
                                senderId = req.user.userId; // This is now set by the authenticateUser middleware

                                fileUrl = req.file ? "".concat(req.protocol, "://").concat(req.get("host"), "/api/image/").concat(req.file.filename) : null;
                                console.log("receiver id===>", receiverId);

                                if (!(!content && !fileUrl && !postId)) {
                                  _context2.next = 10;
                                  break;
                                }

                                return _context2.abrupt("return", res.status(400).send("Content or media must be provided"));

                              case 10:
                                if (!(!receiverId || !/^[a-f0-9]{32}$/.test(receiverId))) {
                                  _context2.next = 13;
                                  break;
                                }

                                console.log("Invalid receiverId format:", receiverId);
                                return _context2.abrupt("return", res.status(400).send("Invalid receiverId format"));

                              case 13:
                                // Validate the format of the userId (as it’s a UUID-based string)
                                isValidUUID = function isValidUUID(id) {
                                  return /^[a-f0-9]{32}$/.test(id);
                                };

                                if (!(!isValidUUID(senderId) || !isValidUUID(receiverId))) {
                                  _context2.next = 17;
                                  break;
                                }

                                console.log("Invalid ID format:", senderId, receiverId);
                                return _context2.abrupt("return", res.status(400).send("Invalid ID format"));

                              case 17:
                                _context2.prev = 17;
                                console.log("inside the try block of the messages route");
                                newMessage = new Message({
                                  sender: senderId,
                                  receiver: receiverId,
                                  content: content,
                                  mediaUrl: fileUrl,
                                  mediaType: req.file ? req.file.mimetype.split("/")[0] : null,
                                  timestamp: new Date(),
                                  replyTo: replyTo || null,
                                  post: post && post._id ? {
                                    postId: post._id || 'null',
                                    // Ensure this matches your schema
                                    caption: post.caption || '',
                                    imageUrl: post.imageUrl || ''
                                  } : null
                                });
                                console.log("Post details:", newMessage);
                                console.log("before saving messages in the database ");
                                console.log("Message here==>more  object before saving:", newMessage);
                                _context2.next = 25;
                                return regeneratorRuntime.awrap(newMessage.save());

                              case 25:
                                console.log("after saving messages in the database ");
                                _context2.next = 28;
                                return regeneratorRuntime.awrap(Conversation.findOne({
                                  participants: {
                                    $all: [senderId, receiverId]
                                  }
                                }));

                              case 28:
                                conversation = _context2.sent;

                                if (!conversation) {
                                  conversation = new Conversation({
                                    participants: [senderId, receiverId],
                                    latestMessage: newMessage._id
                                  });
                                } else {
                                  conversation.latestMessage = newMessage._id;
                                }

                                console.log("before saving conversation in the database ");
                                _context2.next = 33;
                                return regeneratorRuntime.awrap(conversation.save());

                              case 33:
                                console.log("after saving conversation in the database succesfull"); // Fetch sender's full name

                                _context2.next = 36;
                                return regeneratorRuntime.awrap(userr.findOne({
                                  userId: senderId
                                }));

                              case 36:
                                sender = _context2.sent;

                                if (/^[a-f0-9]{32}$/.test(senderId)) {
                                  _context2.next = 40;
                                  break;
                                }

                                console.log("Invalid receiverId format:", senderId);
                                return _context2.abrupt("return", res.status(400).json({
                                  error: "Invalid receiverId format"
                                }));

                              case 40:
                                if (sender) {
                                  _context2.next = 42;
                                  break;
                                }

                                return _context2.abrupt("return", res.status(404).json({
                                  error: "Sender not found"
                                }));

                              case 42:
                                senderFullName = sender.fullName || 'Unknown Sender';
                                console.log("here senderFullName==>", senderFullName); // Create a notification for the receiver

                                console.log("Post object:", post);

                                if (post) {
                                  console.log("Post postedBy:", post.postedBy);
                                }

                                newNotification = new Notification({
                                  userId: receiverId,
                                  type: 'message',
                                  content: "You have a new message from ".concat(senderFullName),
                                  data: {
                                    messageId: newMessage._id
                                  },
                                  read: false
                                });

                                if (/^[a-f0-9]{32}$/.test(receiverId)) {
                                  _context2.next = 50;
                                  break;
                                }

                                console.log("Invalid receiverId format:", receiverId);
                                return _context2.abrupt("return", res.status(400).json({
                                  error: "Invalid receiverId format"
                                }));

                              case 50:
                                console.log("before saving notification in the database ");
                                _context2.next = 53;
                                return regeneratorRuntime.awrap(newNotification.save());

                              case 53:
                                console.log("after saving notification in the database ");
                                res.status(201).json(newMessage);
                                _context2.next = 61;
                                break;

                              case 57:
                                _context2.prev = 57;
                                _context2.t0 = _context2["catch"](17);
                                console.error("Error sending message:", _context2.t0);
                                res.status(500).send("Error sending message");

                              case 61:
                              case "end":
                                return _context2.stop();
                            }
                          }
                        }, null, null, [[17, 57]]);
                      });
                      app.get("/api/notifications", authenticateUser, function _callee3(req, res) {
                        var userId, notifications;
                        return regeneratorRuntime.async(function _callee3$(_context3) {
                          while (1) {
                            switch (_context3.prev = _context3.next) {
                              case 0:
                                console.log("inside the /api/notifications");
                                userId = req.user.userId;
                                _context3.prev = 2;
                                console.log("inside try block of  the /api/notifications");
                                _context3.next = 6;
                                return regeneratorRuntime.awrap(Notification.find({
                                  userId: userId
                                }).sort({
                                  createdAt: -1
                                }));

                              case 6:
                                notifications = _context3.sent;
                                res.json(notifications);
                                _context3.next = 13;
                                break;

                              case 10:
                                _context3.prev = 10;
                                _context3.t0 = _context3["catch"](2);
                                res.status(500).json({
                                  error: "Failed to fetch notifications"
                                });

                              case 13:
                              case "end":
                                return _context3.stop();
                            }
                          }
                        }, null, null, [[2, 10]]);
                      });
                      app.post("/api/notifications", authenticateUser, function _callee4(req, res) {
                        var _req$body2, type, content, data, userId, newNotification;

                        return regeneratorRuntime.async(function _callee4$(_context4) {
                          while (1) {
                            switch (_context4.prev = _context4.next) {
                              case 0:
                                _req$body2 = req.body, type = _req$body2.type, content = _req$body2.content, data = _req$body2.data; // Assuming these fields are sent in the request body

                                userId = req.user.userId; // Assuming the user is authenticated

                                _context4.prev = 2;
                                newNotification = new Notification({
                                  userId: userId,
                                  type: type,
                                  content: content,
                                  data: data,
                                  read: false
                                });
                                _context4.next = 6;
                                return regeneratorRuntime.awrap(newNotification.save());

                              case 6:
                                res.status(201).json({
                                  message: "Notification created",
                                  notification: newNotification
                                });
                                _context4.next = 13;
                                break;

                              case 9:
                                _context4.prev = 9;
                                _context4.t0 = _context4["catch"](2);
                                console.error("Failed to create notification:", _context4.t0);
                                res.status(500).json({
                                  error: "Failed to create notification"
                                });

                              case 13:
                              case "end":
                                return _context4.stop();
                            }
                          }
                        }, null, null, [[2, 9]]);
                      });
                      app.put("/api/notifications/:id/read", authenticateUser, function _callee5(req, res) {
                        var notificationId, notification;
                        return regeneratorRuntime.async(function _callee5$(_context5) {
                          while (1) {
                            switch (_context5.prev = _context5.next) {
                              case 0:
                                notificationId = req.params.id;
                                _context5.prev = 1;
                                _context5.next = 4;
                                return regeneratorRuntime.awrap(Notification.findOneAndUpdate({
                                  _id: notificationId,
                                  userId: req.user.userId
                                }, {
                                  read: true
                                }, {
                                  "new": true
                                }));

                              case 4:
                                notification = _context5.sent;

                                if (notification) {
                                  _context5.next = 7;
                                  break;
                                }

                                return _context5.abrupt("return", res.status(404).json({
                                  error: "Notification not found or not authorized"
                                }));

                              case 7:
                                res.json({
                                  message: "Notification marked as read",
                                  notification: notification
                                });
                                _context5.next = 14;
                                break;

                              case 10:
                                _context5.prev = 10;
                                _context5.t0 = _context5["catch"](1);
                                console.error("Failed to mark notification as read:", _context5.t0);
                                res.status(500).json({
                                  error: "Failed to mark notification as read"
                                });

                              case 14:
                              case "end":
                                return _context5.stop();
                            }
                          }
                        }, null, null, [[1, 10]]);
                      });
                      app.post("/api/upload", authenticateUser, upload.single("file"), function _callee6(req, res) {
                        var _req$body3, userId, caption, newPost, savedPost;

                        return regeneratorRuntime.async(function _callee6$(_context6) {
                          while (1) {
                            switch (_context6.prev = _context6.next) {
                              case 0:
                                console.log("File upload request received");

                                if (req.file) {
                                  _context6.next = 4;
                                  break;
                                }

                                console.error("No file received");
                                return _context6.abrupt("return", res.status(400).json({
                                  error: "No file received"
                                }));

                              case 4:
                                console.log("Uploaded file:", req.file);
                                _req$body3 = req.body, userId = _req$body3.userId, caption = _req$body3.caption;
                                newPost = new Postss({
                                  user: userId,
                                  caption: caption,
                                  imageUrl: "image/".concat(req.file.filename),
                                  date: new Date()
                                });
                                _context6.prev = 7;
                                console.log("inside try block of the upload post");
                                _context6.next = 11;
                                return regeneratorRuntime.awrap(newPost.save());

                              case 11:
                                savedPost = _context6.sent;
                                res.json(savedPost);
                                console.log("before io savedpost");
                                io.emit("newPost", savedPost);
                                console.log("after io savedpost");
                                _context6.next = 22;
                                break;

                              case 18:
                                _context6.prev = 18;
                                _context6.t0 = _context6["catch"](7);
                                console.error("Error saving post:", _context6.t0);
                                res.status(500).send(_context6.t0);

                              case 22:
                              case "end":
                                return _context6.stop();
                            }
                          }
                        }, null, null, [[7, 18]]);
                      });
                      app.put('/api/users/:userId/fullName', authenticateUser, function _callee7(req, res) {
                        var userId, fullName, user;
                        return regeneratorRuntime.async(function _callee7$(_context7) {
                          while (1) {
                            switch (_context7.prev = _context7.next) {
                              case 0:
                                userId = req.params.userId;
                                fullName = req.body.fullName;

                                if (fullName) {
                                  _context7.next = 4;
                                  break;
                                }

                                return _context7.abrupt("return", res.status(400).json({
                                  error: 'fullName is required'
                                }));

                              case 4:
                                _context7.prev = 4;
                                _context7.next = 7;
                                return regeneratorRuntime.awrap(userr.findOne({
                                  userId: userId
                                }));

                              case 7:
                                user = _context7.sent;

                                if (user) {
                                  _context7.next = 10;
                                  break;
                                }

                                return _context7.abrupt("return", res.status(404).json({
                                  error: 'User not found'
                                }));

                              case 10:
                                user.fullName = fullName;
                                _context7.next = 13;
                                return regeneratorRuntime.awrap(user.save());

                              case 13:
                                res.status(200).json({
                                  message: 'fullName updated successfully',
                                  fullName: user.fullName
                                });
                                _context7.next = 20;
                                break;

                              case 16:
                                _context7.prev = 16;
                                _context7.t0 = _context7["catch"](4);
                                console.error('Error updating fullName:', _context7.t0);
                                res.status(500).json({
                                  error: 'Server error'
                                });

                              case 20:
                              case "end":
                                return _context7.stop();
                            }
                          }
                        }, null, null, [[4, 16]]);
                      }); // Update user profile

                      app.put("/api/profile/:userId", authenticateUser, upload.single("ProfileImageURL"), function _callee8(req, res) {
                        var userId, _req$body4, Bio, Gender, Name, ProfileImageURL, profile;

                        return regeneratorRuntime.async(function _callee8$(_context8) {
                          while (1) {
                            switch (_context8.prev = _context8.next) {
                              case 0:
                                console.log("inisde the /profile/${userId} route");
                                userId = req.params.userId;
                                _req$body4 = req.body, Bio = _req$body4.Bio, Gender = _req$body4.Gender, Name = _req$body4.Name;
                                ProfileImageURL = req.file ? "image/".concat(req.file.filename) : null; // Validate the userId format

                                if (/^[a-f0-9]{32}$/.test(userId)) {
                                  _context8.next = 7;
                                  break;
                                }

                                console.log("Invalid userId format:", userId);
                                return _context8.abrupt("return", res.status(400).json({
                                  error: "Invalid userId format"
                                }));

                              case 7:
                                _context8.prev = 7;
                                // Find the profile by userId
                                console.log("inisde try block of the /profile/${userId} route");
                                _context8.next = 11;
                                return regeneratorRuntime.awrap(Profile.findOne({
                                  userId: userId
                                }));

                              case 11:
                                profile = _context8.sent;

                                if (profile) {
                                  _context8.next = 15;
                                  break;
                                }

                                console.log("Profile not found for userId:", userId);
                                return _context8.abrupt("return", res.status(404).json({
                                  error: "Profile not found"
                                }));

                              case 15:
                                // Update the profile fields
                                if (Name) profile.Name = Name;
                                if (Bio) profile.Bio = Bio;
                                if (Gender) profile.Gender = Gender;
                                if (ProfileImageURL) profile.ProfileImageURL = ProfileImageURL; // Save the updated profile

                                console.log("inisde the /profile/${userId} before saving in database");
                                _context8.next = 22;
                                return regeneratorRuntime.awrap(profile.save());

                              case 22:
                                console.log("inisde the /profile/${userId} after saving in database");
                                res.status(200).json(profile);
                                _context8.next = 30;
                                break;

                              case 26:
                                _context8.prev = 26;
                                _context8.t0 = _context8["catch"](7);
                                console.error("Error updating profile:", _context8.t0);
                                res.status(500).json({
                                  error: "Server error"
                                });

                              case 30:
                              case "end":
                                return _context8.stop();
                            }
                          }
                        }, null, null, [[7, 26]]);
                      });
                      app.post("/api/profile", authenticateUser, upload.single("ProfileImageURL"), function _callee9(req, res) {
                        var _req$body5, Bio, Gender, userId, ProfileImageURL, newProfile;

                        return regeneratorRuntime.async(function _callee9$(_context9) {
                          while (1) {
                            switch (_context9.prev = _context9.next) {
                              case 0:
                                console.log("inside the /api/profile ==>here shekar correct");
                                _req$body5 = req.body, Bio = _req$body5.Bio, Gender = _req$body5.Gender, userId = _req$body5.userId; // Extract userId from the request body

                                ProfileImageURL = "image/".concat(req.file.filename);
                                _context9.prev = 3;
                                console.log("inside the try /api/profile");
                                newProfile = new Profile({
                                  Bio: Bio,
                                  Gender: Gender,
                                  ProfileImageURL: ProfileImageURL,
                                  userId: userId // Include userId when creating a new profile

                                });
                                _context9.next = 8;
                                return regeneratorRuntime.awrap(newProfile.save());

                              case 8:
                                res.status(201).json(newProfile);
                                _context9.next = 15;
                                break;

                              case 11:
                                _context9.prev = 11;
                                _context9.t0 = _context9["catch"](3);
                                console.error("Error creating profile:", _context9.t0);
                                res.status(500).json({
                                  error: "Server error"
                                });

                              case 15:
                              case "end":
                                return _context9.stop();
                            }
                          }
                        }, null, null, [[3, 11]]);
                      });
                      app.get("/api/profile/check/:userId", function _callee10(req, res) {
                        var userId, profile;
                        return regeneratorRuntime.async(function _callee10$(_context10) {
                          while (1) {
                            switch (_context10.prev = _context10.next) {
                              case 0:
                                console.log("inside the /api/profile/check/:userId");
                                userId = req.params.userId;

                                if (/^[a-f0-9]{32}$/.test(userId)) {
                                  _context10.next = 5;
                                  break;
                                }

                                console.log("Invalid userId format:", userId);
                                return _context10.abrupt("return", res.status(400).send("Invalid userId format"));

                              case 5:
                                _context10.prev = 5;
                                console.log("inisde the try of /api/profile/check/:userId");
                                _context10.next = 9;
                                return regeneratorRuntime.awrap(Profile.findOne({
                                  userId: userId
                                }));

                              case 9:
                                profile = _context10.sent;
                                console.log("after getting profile details here", profile);

                                if (!profile) {
                                  _context10.next = 16;
                                  break;
                                }

                                console.log(" in if block after getting profile details here", profile);
                                return _context10.abrupt("return", res.json({
                                  exists: true,
                                  profileId: profile._id,
                                  ProfileImageURL: profile.ProfileImageURL
                                }));

                              case 16:
                                console.log(" in else block after getting profile details here", profile);
                                return _context10.abrupt("return", res.json({
                                  exists: false
                                }));

                              case 18:
                                _context10.next = 24;
                                break;

                              case 20:
                                _context10.prev = 20;
                                _context10.t0 = _context10["catch"](5);
                                console.error("Error checking profile:", _context10.t0);
                                res.status(500).json({
                                  error: "Server error"
                                });

                              case 24:
                              case "end":
                                return _context10.stop();
                            }
                          }
                        }, null, null, [[5, 20]]);
                      }); // app.put(
                      //   "/api/profile/update-pic/:userId",
                      //   authenticateUser,
                      //   async (req, res) => {
                      //     const { userId } = req.params;
                      //     const { ProfileImageURL } = req.body;
                      //     console.log("inside the update-pic");
                      //     try {
                      //       console.log("inside try block of the update-pic");
                      //       const profile = await Profile.findOneAndUpdate(
                      //         { userId },
                      //         { ProfileImageURL },
                      //         { new: true }
                      //       );
                      //       if (!profile) {
                      //         return res.status(404).json({ error: "Profile not found" });
                      //       }
                      //       console.log("return new url");
                      //       console.log("updated url coming from here shekar  ==>", profile);
                      //       res.json(profile); // Ensure the updated profile is returned
                      //     } catch (error) {
                      //       console.error("Error updating profile picture:", error);
                      //       res.status(500).json({ error: "Server error" });
                      //     }
                      //   }
                      // );

                      app.get("/api/", function (req, res) {
                        res.send("App is Working");
                      });
                      app.post("/api/Login", function _callee11(req, res) {
                        var _req$body6, username, password, user, token;

                        return regeneratorRuntime.async(function _callee11$(_context11) {
                          while (1) {
                            switch (_context11.prev = _context11.next) {
                              case 0:
                                _req$body6 = req.body, username = _req$body6.username, password = _req$body6.password;
                                console.log("inside the login");
                                _context11.prev = 2;
                                _context11.next = 5;
                                return regeneratorRuntime.awrap(userr.findOne({
                                  username: username
                                }));

                              case 5:
                                user = _context11.sent;
                                _context11.t0 = user;

                                if (!_context11.t0) {
                                  _context11.next = 11;
                                  break;
                                }

                                _context11.next = 10;
                                return regeneratorRuntime.awrap(bcrypt.compare(password, user.password));

                              case 10:
                                _context11.t0 = _context11.sent;

                              case 11:
                                if (!_context11.t0) {
                                  _context11.next = 23;
                                  break;
                                }

                                console.log("inside the login1");
                                token = jwt.sign({
                                  userId: user.userId
                                }, process.env.JWT_SECRET, {
                                  expiresIn: "20m"
                                } // Short-lived JWT
                                );
                                console.log("inside the login3");
                                user.tokens = user.tokens || [];
                                user.tokens.push({
                                  token: token
                                });
                                _context11.next = 19;
                                return regeneratorRuntime.awrap(user.save());

                              case 19:
                                console.log("inside the login4 after");
                                return _context11.abrupt("return", res.status(200).send({
                                  user: user,
                                  token: token
                                }));

                              case 23:
                                return _context11.abrupt("return", res.status(401).json({
                                  message: "Invalid username or password"
                                }));

                              case 24:
                                _context11.next = 30;
                                break;

                              case 26:
                                _context11.prev = 26;
                                _context11.t1 = _context11["catch"](2);
                                console.error("Error during login:", _context11.t1);
                                res.status(500).json({
                                  message: "Server error"
                                });

                              case 30:
                              case "end":
                                return _context11.stop();
                            }
                          }
                        }, null, null, [[2, 26]]);
                      });
                      app.post("/api/Signup", function _callee12(req, res) {
                        var _req$body7, fullName, username, password, userId, createdAt, salt, hashPassword, data, existingUser;

                        return regeneratorRuntime.async(function _callee12$(_context12) {
                          while (1) {
                            switch (_context12.prev = _context12.next) {
                              case 0:
                                _req$body7 = req.body, fullName = _req$body7.fullName, username = _req$body7.username, password = _req$body7.password, userId = _req$body7.userId, createdAt = _req$body7.createdAt;
                                salt = 10;
                                _context12.next = 4;
                                return regeneratorRuntime.awrap(bcrypt.hash(password, salt));

                              case 4:
                                hashPassword = _context12.sent;
                                data = new userr({
                                  fullName: fullName,
                                  username: username,
                                  password: hashPassword,
                                  userId: userId,
                                  createdAt: createdAt
                                });
                                _context12.prev = 6;
                                _context12.next = 9;
                                return regeneratorRuntime.awrap(userr.findOne({
                                  username: username
                                }));

                              case 9:
                                existingUser = _context12.sent;

                                if (!existingUser) {
                                  _context12.next = 14;
                                  break;
                                }

                                res.json("exist");
                                _context12.next = 17;
                                break;

                              case 14:
                                _context12.next = 16;
                                return regeneratorRuntime.awrap(userr.insertMany([data]));

                              case 16:
                                res.json("not exist");

                              case 17:
                                _context12.next = 22;
                                break;

                              case 19:
                                _context12.prev = 19;
                                _context12.t0 = _context12["catch"](6);
                                res.json("catch error");

                              case 22:
                              case "end":
                                return _context12.stop();
                            }
                          }
                        }, null, null, [[6, 19]]);
                      });
                      app.use("/api/users", authenticateUser);
                      app.use("/api/upload", authenticateUser);
                      app.use("/api/posts", authenticateUser);
                      app.use("/api/users/:id", authenticateUser);
                      app.get("/api/users", function _callee13(req, res) {
                        var users;
                        return regeneratorRuntime.async(function _callee13$(_context13) {
                          while (1) {
                            switch (_context13.prev = _context13.next) {
                              case 0:
                                _context13.prev = 0;
                                _context13.next = 3;
                                return regeneratorRuntime.awrap(userr.find({}, "fullName userId"));

                              case 3:
                                users = _context13.sent;
                                res.status(200).json(users);
                                _context13.next = 10;
                                break;

                              case 7:
                                _context13.prev = 7;
                                _context13.t0 = _context13["catch"](0);
                                res.status(500).json({
                                  error: "Failed to fetch users"
                                });

                              case 10:
                              case "end":
                                return _context13.stop();
                            }
                          }
                        }, null, null, [[0, 7]]);
                      });
                      app.get("/api/users/:userid", function _callee14(req, res) {
                        var userId, user;
                        return regeneratorRuntime.async(function _callee14$(_context14) {
                          while (1) {
                            switch (_context14.prev = _context14.next) {
                              case 0:
                                userId = req.params.userid;
                                _context14.prev = 1;
                                _context14.next = 4;
                                return regeneratorRuntime.awrap(userr.findOne({
                                  userId: userId
                                }));

                              case 4:
                                user = _context14.sent;

                                if (user) {
                                  res.json(user);
                                } else {
                                  res.status(404).send({
                                    message: "User not found"
                                  });
                                }

                                _context14.next = 11;
                                break;

                              case 8:
                                _context14.prev = 8;
                                _context14.t0 = _context14["catch"](1);
                                res.status(500).json({
                                  error: "Failed to fetch user"
                                });

                              case 11:
                              case "end":
                                return _context14.stop();
                            }
                          }
                        }, null, null, [[1, 8]]);
                      }); //app.use("/api/image", express.static(path.join(__dirname, "..", "image")));

                      app.get("/api/image/:filename", function _callee15(req, res) {
                        var filesCursor, files, file, readstream;
                        return regeneratorRuntime.async(function _callee15$(_context15) {
                          while (1) {
                            switch (_context15.prev = _context15.next) {
                              case 0:
                                console.log("Received request to fetch image: ".concat(req.params.filename));

                                if (gridfsBucket) {
                                  _context15.next = 4;
                                  break;
                                }

                                console.error("GridFSBucket not initialized");
                                return _context15.abrupt("return", res.status(500).json({
                                  err: "GridFSBucket not initialized"
                                }));

                              case 4:
                                _context15.prev = 4;
                                filesCursor = gridfsBucket.find({
                                  filename: req.params.filename
                                });
                                _context15.next = 8;
                                return regeneratorRuntime.awrap(filesCursor.toArray());

                              case 8:
                                files = _context15.sent;

                                if (!(!files || files.length === 0)) {
                                  _context15.next = 12;
                                  break;
                                }

                                console.log("No file exists with the name:"(_templateObject(), req.params.filename));
                                return _context15.abrupt("return", res.status(404).json({
                                  err: "No file exists"
                                }));

                              case 12:
                                file = files[0];

                                if (file.contentType === "image/jpeg" || file.contentType === "image/webp" || file.contentType === "image/png" || file.contentType === "video/mp4" || file.contentType === "audio/webm" || // Added support for audio/webm
                                file.contentType === "audio/mpeg" // Add other audio types if needed
                                ) {
                                    res.set("Content-Type", file.contentType);
                                    res.set("Cache-Control", "no-store");
                                    res.set("Accept-Ranges", "bytes");
                                    readstream = gridfsBucket.openDownloadStreamByName(req.params.filename);
                                    readstream.on("error", function (err) {
                                      res.status(500).json({
                                        err: "Error reading file"
                                      });
                                    });
                                    readstream.pipe(res);
                                  } else {
                                  console.log("Not a supported media type for file: ".concat(req.params.filename));
                                  res.status(404).json({
                                    err: "Not a supported media type"
                                  });
                                }

                                _context15.next = 20;
                                break;

                              case 16:
                                _context15.prev = 16;
                                _context15.t0 = _context15["catch"](4);
                                console.error("Unexpected error occurred:", _context15.t0);
                                res.status(500).json({
                                  err: "Unexpected error occurred"
                                });

                              case 20:
                              case "end":
                                return _context15.stop();
                            }
                          }
                        }, null, null, [[4, 16]]);
                      });
                      app.get("/api/posts", function _callee16(req, res) {
                        var posts, userIds, users, userMap, postsWithUser;
                        return regeneratorRuntime.async(function _callee16$(_context16) {
                          while (1) {
                            switch (_context16.prev = _context16.next) {
                              case 0:
                                console.log("Received request to /posts");
                                _context16.prev = 1;
                                _context16.next = 4;
                                return regeneratorRuntime.awrap(Postss.find());

                              case 4:
                                posts = _context16.sent;
                                userIds = posts.map(function (post) {
                                  return post.user;
                                });
                                _context16.next = 8;
                                return regeneratorRuntime.awrap(userr.find({
                                  userId: {
                                    $in: userIds
                                  }
                                }));

                              case 8:
                                users = _context16.sent;
                                userMap = users.reduce(function (map, user) {
                                  map[user.userId] = user;
                                  return map;
                                }, {});
                                postsWithUser = posts.map(function (post) {
                                  return _objectSpread({}, post._doc, {
                                    user: {
                                      username: userMap[post.user].username,
                                      fullName: userMap[post.user].fullName
                                    }
                                  });
                                });
                                console.log("Posts with user data:", postsWithUser);
                                res.json(postsWithUser);
                                _context16.next = 19;
                                break;

                              case 15:
                                _context16.prev = 15;
                                _context16.t0 = _context16["catch"](1);
                                console.error("Error fetching posts:", _context16.t0);
                                res.status(500).send(_context16.t0);

                              case 19:
                              case "end":
                                return _context16.stop();
                            }
                          }
                        }, null, null, [[1, 15]]);
                      });
                      app.post("/api/posts/:id/like", function _callee17(req, res) {
                        var postId, userId, post, hasLiked, liker, likerFullName, newNotification;
                        return regeneratorRuntime.async(function _callee17$(_context17) {
                          while (1) {
                            switch (_context17.prev = _context17.next) {
                              case 0:
                                postId = req.params.id;
                                userId = req.user.userId; // Assuming userId is stored in the JWT payload

                                _context17.prev = 2;
                                _context17.next = 5;
                                return regeneratorRuntime.awrap(Postss.findById(postId));

                              case 5:
                                post = _context17.sent;

                                if (post) {
                                  _context17.next = 8;
                                  break;
                                }

                                return _context17.abrupt("return", res.status(404).send({
                                  message: "Post not found"
                                }));

                              case 8:
                                // Check if the user has already liked the post
                                hasLiked = post.likedBy.includes(userId);

                                if (hasLiked) {
                                  // User is unliking the post
                                  post.likes -= 1;
                                  post.likedBy.pull(userId);
                                } else {
                                  // User is liking the post
                                  post.likes += 1;
                                  post.likedBy.push(userId);
                                }

                                _context17.next = 12;
                                return regeneratorRuntime.awrap(post.save());

                              case 12:
                                _context17.next = 14;
                                return regeneratorRuntime.awrap(userr.findOne({
                                  userId: userId
                                }));

                              case 14:
                                liker = _context17.sent;

                                if (liker) {
                                  _context17.next = 17;
                                  break;
                                }

                                return _context17.abrupt("return", res.status(404).json({
                                  error: "User not found"
                                }));

                              case 17:
                                likerFullName = liker.fullName || 'Unknown User'; // Ensure post.user is defined

                                if (post.user) {
                                  _context17.next = 21;
                                  break;
                                }

                                console.error("Error: Post ownerId is missing.");
                                return _context17.abrupt("return", res.status(500).json({
                                  error: "Post ownerId is missing."
                                }));

                              case 21:
                                // Create a notification for the owner of the post
                                newNotification = new Notification({
                                  userId: post.user,
                                  // This should be the ID of the post owner
                                  type: 'like',
                                  content: "".concat(likerFullName, " liked your post."),
                                  data: {
                                    postId: post._id
                                  },
                                  read: false
                                });
                                console.log("before saving notification in the database in post likes");
                                _context17.next = 25;
                                return regeneratorRuntime.awrap(newNotification.save());

                              case 25:
                                console.log("after saving notification in the database in post likes");
                                res.json({
                                  likes: post.likes,
                                  liked: !hasLiked
                                });
                                _context17.next = 33;
                                break;

                              case 29:
                                _context17.prev = 29;
                                _context17.t0 = _context17["catch"](2);
                                console.error("Error liking post:", _context17.t0);
                                res.status(500).send(_context17.t0);

                              case 33:
                              case "end":
                                return _context17.stop();
                            }
                          }
                        }, null, null, [[2, 29]]);
                      });
                      app.get("/api/search", authenticateUser, function _callee18(req, res) {
                        var query, users;
                        return regeneratorRuntime.async(function _callee18$(_context18) {
                          while (1) {
                            switch (_context18.prev = _context18.next) {
                              case 0:
                                query = req.query.query;
                                console.log("inside the search route");

                                if (query) {
                                  _context18.next = 4;
                                  break;
                                }

                                return _context18.abrupt("return", res.status(400).json({
                                  error: "Query parameter is required"
                                }));

                              case 4:
                                _context18.prev = 4;
                                console.log("inside try of the search route");
                                _context18.next = 8;
                                return regeneratorRuntime.awrap(userr.find({
                                  fullName: {
                                    $regex: query,
                                    $options: "i"
                                  }
                                }, "fullName userId"));

                              case 8:
                                users = _context18.sent;
                                res.status(200).json(users);
                                _context18.next = 16;
                                break;

                              case 12:
                                _context18.prev = 12;
                                _context18.t0 = _context18["catch"](4);
                                console.error("Error fetching search results:", _context18.t0); // Log the error for debugging

                                res.status(500).json({
                                  error: "Failed to fetch search results"
                                });

                              case 16:
                              case "end":
                                return _context18.stop();
                            }
                          }
                        }, null, null, [[4, 12]]);
                      });
                      app.post("/api/logout", authenticateUser, function _callee19(req, res) {
                        var user, token;
                        return regeneratorRuntime.async(function _callee19$(_context19) {
                          while (1) {
                            switch (_context19.prev = _context19.next) {
                              case 0:
                                _context19.prev = 0;
                                user = req.user; // Retrieved from the middleware

                                token = req.token; // Retrieved from the middleware

                                if (!user) {
                                  _context19.next = 10;
                                  break;
                                }

                                // Remove the token from the user's tokens array
                                user.tokens = user.tokens.filter(function (t) {
                                  return t.token !== token;
                                });
                                _context19.next = 7;
                                return regeneratorRuntime.awrap(user.save());

                              case 7:
                                // Save the user with the updated tokens array
                                res.status(200).json("Logout successful");
                                _context19.next = 11;
                                break;

                              case 10:
                                res.status(404).json("User not found");

                              case 11:
                                _context19.next = 17;
                                break;

                              case 13:
                                _context19.prev = 13;
                                _context19.t0 = _context19["catch"](0);
                                console.error("Error during logout:", _context19.t0);
                                res.status(500).json("Server error");

                              case 17:
                              case "end":
                                return _context19.stop();
                            }
                          }
                        }, null, null, [[0, 13]]);
                      });

                    case 33:
                    case "end":
                      return _context20.stop();
                  }
                }
              });
            });
          } catch (e) {
            console.log(e);
          }

        case 8:
        case "end":
          return _context21.stop();
      }
    }
  });
};

app.get("/api/messages/:receiverId", authenticateUser, function _callee21(req, res) {
  var receiverId, userId, messages;
  return regeneratorRuntime.async(function _callee21$(_context22) {
    while (1) {
      switch (_context22.prev = _context22.next) {
        case 0:
          console.log("inside the messages/reciverid");
          receiverId = req.params.receiverId;
          userId = req.user.userId; // This is now set by the authenticateUser middleware

          console.log("Received receiverId:", receiverId);
          console.log("Current userId:", userId); // Validate the format of userId and receiverId

          if (/^[a-f0-9]{32}$/.test(userId)) {
            _context22.next = 8;
            break;
          }

          console.log("Invalid userId format:", userId.receiverid);
          return _context22.abrupt("return", res.status(400).send("Invalid userId format"));

        case 8:
          if (/^[a-f0-9]{32}$/.test(receiverId)) {
            _context22.next = 11;
            break;
          }

          console.log("Invalid receiverId format:", receiverId);
          return _context22.abrupt("return", res.status(400).send("Invalid receiverId format"));

        case 11:
          _context22.prev = 11;
          console.log("inisde the triy block of message.receiverid");
          _context22.next = 15;
          return regeneratorRuntime.awrap(Message.find({
            $or: [{
              sender: userId,
              receiver: receiverId
            }, {
              sender: receiverId,
              receiver: userId
            }]
          }).sort({
            timestamp: 1
          }));

        case 15:
          messages = _context22.sent;
          res.json(messages);
          console.log("inside the triy block of message.receiverid after sending the json data");
          _context22.next = 24;
          break;

        case 20:
          _context22.prev = 20;
          _context22.t0 = _context22["catch"](11);
          console.error("Error fetching messages:", _context22.t0);
          res.status(500).send("Error fetching messages");

        case 24:
        case "end":
          return _context22.stop();
      }
    }
  }, null, null, [[11, 20]]);
}); //Add this route to handle fetching a profile by ID

app.get("/api/profile/:userId", authenticateUser, function _callee22(req, res) {
  var userId, profile;
  return regeneratorRuntime.async(function _callee22$(_context23) {
    while (1) {
      switch (_context23.prev = _context23.next) {
        case 0:
          userId = req.params.userId;
          console.log("Received userId in request:", userId);
          _context23.prev = 2;
          _context23.next = 5;
          return regeneratorRuntime.awrap(Profile.findOne({
            userId: userId
          }));

        case 5:
          profile = _context23.sent;

          if (profile) {
            _context23.next = 9;
            break;
          }

          console.log("Profile not found");
          return _context23.abrupt("return", res.status(404).json({
            error: "Profile not found"
          }));

        case 9:
          res.json(profile);
          _context23.next = 16;
          break;

        case 12:
          _context23.prev = 12;
          _context23.t0 = _context23["catch"](2);
          console.error("Error fetching profile:", _context23.t0);
          res.status(500).json({
            error: "Server error"
          });

        case 16:
        case "end":
          return _context23.stop();
      }
    }
  }, null, null, [[2, 12]]);
});
connectToDatabase();