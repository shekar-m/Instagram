"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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

var authenticateUser = require('../middleware/authenticateUser'); // Import middleware


var ObjectId = mongoose.Types.ObjectId;

var bcrypt = require('bcrypt');

var jwt = require('jsonwebtoken');

var _require3 = require("react-router-dom"),
    useInRouterContext = _require3.useInRouterContext;

var app = express();
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(cors());
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
  return regeneratorRuntime.async(function connectToDatabase$(_context13) {
    while (1) {
      switch (_context13.prev = _context13.next) {
        case 0:
          http = require("http");
          socketIO = require("socket.io");
          server = http.createServer(app);
          io = socketIO(server, {
            cors: {
              origin: 'http://localhost:3000',
              methods: ['GET', 'POST'],
              credentials: true
            }
          });
          io.on("connection", function (socket) {
            console.log("User connected:", socket.id);
            socket.on("join", function (userId) {
              socket.join(userId);
              console.log("User ".concat(userId, " joined room ").concat(userId));
            });
            socket.on("sendMessage", function _callee(data) {
              var senderId, receiverId, content, mediaUrl, newMessage, conversation;
              return regeneratorRuntime.async(function _callee$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      senderId = data.senderId, receiverId = data.receiverId, content = data.content, mediaUrl = data.mediaUrl;
                      _context.prev = 1;
                      newMessage = new Message({
                        sender: senderId,
                        receiver: receiverId,
                        content: content,
                        mediaUrl: mediaUrl
                      });
                      _context.next = 5;
                      return regeneratorRuntime.awrap(newMessage.save());

                    case 5:
                      _context.next = 7;
                      return regeneratorRuntime.awrap(Conversation.findOne({
                        participants: {
                          $all: [senderId, receiverId]
                        }
                      }));

                    case 7:
                      conversation = _context.sent;

                      if (!conversation) {
                        conversation = new Conversation({
                          participants: [senderId, receiverId],
                          latestMessage: newMessage._id
                        });
                      } else {
                        conversation.latestMessage = newMessage._id;
                      }

                      _context.next = 11;
                      return regeneratorRuntime.awrap(conversation.save());

                    case 11:
                      io.to(receiverId).emit("receiveMessage", newMessage);
                      io.to(senderId).emit("messageSent", newMessage);
                      _context.next = 18;
                      break;

                    case 15:
                      _context.prev = 15;
                      _context.t0 = _context["catch"](1);
                      console.error("Error sending message:", _context.t0);

                    case 18:
                    case "end":
                      return _context.stop();
                  }
                }
              }, null, null, [[1, 15]]);
            });
            socket.on("disconnect", function () {
              console.log("User disconnected:", socket.id);
            });
          });
          PORT = process.env.PORT || 8001;
          server.listen(PORT, function () {
            console.log("Server running on port 8001 from web socket");
          });

          try {
            mongoose.connect("mongodb+srv://Admin:Shekar3999@Cluster1.rnlp84v.mongodb.net/", {
              useNewUrlParser: true,
              useUnifiedTopology: true
            });
            conn = mongoose.connection;
            console.log("mongodb connected successfully");
            conn.once("open", function _callee12() {
              var client, db, storage, upload;
              return regeneratorRuntime.async(function _callee12$(_context12) {
                while (1) {
                  switch (_context12.prev = _context12.next) {
                    case 0:
                      console.log("MongoDB connection opened");
                      client = new MongoClient("mongodb+srv://Admin:Shekar3999@Cluster1.rnlp84v.mongodb.net/", {
                        useNewUrlParser: true,
                        useUnifiedTopology: true
                      });
                      _context12.next = 4;
                      return regeneratorRuntime.awrap(client.connect());

                    case 4:
                      console.log("MongoClient connected");
                      db = client.db();
                      gridfsBucket = new GridFSBucket(db, {
                        bucketName: "uploads"
                      });
                      console.log("GridFSBucket initialized");
                      storage = new GridFsStorage({
                        url: "mongodb+srv://Admin:Shekar3999@Cluster1.rnlp84v.mongodb.net/",
                        options: {
                          useNewUrlParser: true,
                          useUnifiedTopology: true
                        },
                        file: function file(req, _file) {
                          return {
                            bucketName: "uploads",
                            filename: "".concat(Date.now(), "-").concat(_file.originalname),
                            contentType: _file.mimetype
                          };
                        }
                      });
                      upload = multer({
                        storage: storage
                      });
                      app.get("/", function (req, res) {
                        res.send("App is Working");
                      });
                      app.post("/Login", function _callee2(req, res) {
                        var _req$body, username, password, user, token;

                        return regeneratorRuntime.async(function _callee2$(_context2) {
                          while (1) {
                            switch (_context2.prev = _context2.next) {
                              case 0:
                                _req$body = req.body, username = _req$body.username, password = _req$body.password;
                                _context2.prev = 1;
                                _context2.next = 4;
                                return regeneratorRuntime.awrap(userr.findOne({
                                  username: username
                                }));

                              case 4:
                                user = _context2.sent;
                                _context2.t0 = user;

                                if (!_context2.t0) {
                                  _context2.next = 10;
                                  break;
                                }

                                _context2.next = 9;
                                return regeneratorRuntime.awrap(bcrypt.compare(password, user.password));

                              case 9:
                                _context2.t0 = _context2.sent;

                              case 10:
                                if (!_context2.t0) {
                                  _context2.next = 19;
                                  break;
                                }

                                // Generate JWT token
                                token = jwt.sign({
                                  userId: user.userId
                                }, process.env.JWT_SECRET, {
                                  expiresIn: '1h'
                                }); // Ensure tokens field is an array

                                user.tokens = user.tokens || []; // Save token to the user's tokens array in the database

                                user.tokens.push({
                                  token: token
                                });
                                _context2.next = 16;
                                return regeneratorRuntime.awrap(user.save());

                              case 16:
                                res.send({
                                  user: user,
                                  token: token
                                });
                                _context2.next = 20;
                                break;

                              case 19:
                                res.status(401).json("Invalid username or password");

                              case 20:
                                _context2.next = 26;
                                break;

                              case 22:
                                _context2.prev = 22;
                                _context2.t1 = _context2["catch"](1);
                                console.error("Error during login:", _context2.t1);
                                res.status(500).json("Server error");

                              case 26:
                              case "end":
                                return _context2.stop();
                            }
                          }
                        }, null, null, [[1, 22]]);
                      });
                      app.post("/Signup", function _callee3(req, res) {
                        var _req$body2, username, password, userId, createdAt, salt, hashPassword, data, existingUser;

                        return regeneratorRuntime.async(function _callee3$(_context3) {
                          while (1) {
                            switch (_context3.prev = _context3.next) {
                              case 0:
                                console.log("inside the signup");
                                _req$body2 = req.body, username = _req$body2.username, password = _req$body2.password, userId = _req$body2.userId, createdAt = _req$body2.createdAt;
                                salt = 10;
                                console.log("before hashhing");
                                _context3.next = 6;
                                return regeneratorRuntime.awrap(bcrypt.hash(password, salt));

                              case 6:
                                hashPassword = _context3.sent;
                                console.log("after hashhing");
                                data = new userr({
                                  username: username,
                                  password: hashPassword,
                                  userId: userId,
                                  createdAt: createdAt
                                });
                                _context3.prev = 9;
                                console.log("inside the try block");
                                console.log("checking  in before server");
                                _context3.next = 14;
                                return regeneratorRuntime.awrap(userr.findOne({
                                  username: username
                                }));

                              case 14:
                                existingUser = _context3.sent;
                                console.log("checking  in before server");

                                if (!existingUser) {
                                  _context3.next = 21;
                                  break;
                                }

                                console.log("exister user in bakend server");
                                res.json("exist");
                                _context3.next = 26;
                                break;

                              case 21:
                                console.log("in else block");
                                _context3.next = 24;
                                return regeneratorRuntime.awrap(userr.insertMany([data]));

                              case 24:
                                console.log("inserting here successfully");
                                res.json("not exist");

                              case 26:
                                _context3.next = 31;
                                break;

                              case 28:
                                _context3.prev = 28;
                                _context3.t0 = _context3["catch"](9);
                                res.json("catch error");

                              case 31:
                              case "end":
                                return _context3.stop();
                            }
                          }
                        }, null, null, [[9, 28]]);
                      }); // Apply the middleware to all routes that require authentication
                      // app.use(authenticateUser);

                      app.use('/users', authenticateUser);
                      app.use('/upload', authenticateUser);
                      app.use('/posts', authenticateUser); // app.use('/image/:filename', authenticateUser);
                      // app.use('/send-message', authenticateUser);
                      // app.use('/conversations', authenticateUser);
                      // app.use('/messages', authenticateUser);

                      app.get("/users", function _callee4(req, res) {
                        var users;
                        return regeneratorRuntime.async(function _callee4$(_context4) {
                          while (1) {
                            switch (_context4.prev = _context4.next) {
                              case 0:
                                _context4.prev = 0;
                                _context4.next = 3;
                                return regeneratorRuntime.awrap(userr.find({}, 'username userId'));

                              case 3:
                                users = _context4.sent;
                                res.status(200).json(users);
                                _context4.next = 10;
                                break;

                              case 7:
                                _context4.prev = 7;
                                _context4.t0 = _context4["catch"](0);
                                res.status(500).json({
                                  error: "Failed to fetch users"
                                });

                              case 10:
                              case "end":
                                return _context4.stop();
                            }
                          }
                        }, null, null, [[0, 7]]);
                      });
                      app.use("/image", express["static"](path.join(__dirname, "..", "image")));
                      app.post("/upload", upload.single("file"), function _callee5(req, res) {
                        var date, _req$body3, userId, caption, newPost, savedPost;

                        return regeneratorRuntime.async(function _callee5$(_context5) {
                          while (1) {
                            switch (_context5.prev = _context5.next) {
                              case 0:
                                if (req.file) {
                                  _context5.next = 2;
                                  break;
                                }

                                return _context5.abrupt("return", res.status(400).json({
                                  error: "No file received"
                                }));

                              case 2:
                                date = new Date();
                                _req$body3 = req.body, userId = _req$body3.userId, caption = _req$body3.caption;
                                newPost = new Postss({
                                  user: userId,
                                  caption: caption,
                                  imageUrl: "image/".concat(req.file.filename),
                                  date: date
                                });
                                _context5.prev = 5;
                                _context5.next = 8;
                                return regeneratorRuntime.awrap(newPost.save());

                              case 8:
                                savedPost = _context5.sent;
                                res.json(savedPost);
                                _context5.next = 15;
                                break;

                              case 12:
                                _context5.prev = 12;
                                _context5.t0 = _context5["catch"](5);
                                res.status(500).send(_context5.t0);

                              case 15:
                              case "end":
                                return _context5.stop();
                            }
                          }
                        }, null, null, [[5, 12]]);
                      });
                      app.get("/image/:filename", function _callee6(req, res) {
                        var filesCursor, files, file, readstream;
                        return regeneratorRuntime.async(function _callee6$(_context6) {
                          while (1) {
                            switch (_context6.prev = _context6.next) {
                              case 0:
                                console.log("Received request to fetch image: ".concat(req.params.filename));

                                if (gridfsBucket) {
                                  _context6.next = 4;
                                  break;
                                }

                                console.error("GridFSBucket not initialized");
                                return _context6.abrupt("return", res.status(500).json({
                                  err: "GridFSBucket not initialized"
                                }));

                              case 4:
                                _context6.prev = 4;
                                filesCursor = gridfsBucket.find({
                                  filename: req.params.filename
                                });
                                _context6.next = 8;
                                return regeneratorRuntime.awrap(filesCursor.toArray());

                              case 8:
                                files = _context6.sent;

                                if (!(!files || files.length === 0)) {
                                  _context6.next = 12;
                                  break;
                                }

                                console.log("No file exists with the name: ".concat(req.params.filename));
                                return _context6.abrupt("return", res.status(404).json({
                                  err: "No file exists"
                                }));

                              case 12:
                                file = files[0];

                                if (file.contentType === "image/jpeg" || file.contentType === "image/png" || file.contentType === "video/mp4") {
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

                                _context6.next = 20;
                                break;

                              case 16:
                                _context6.prev = 16;
                                _context6.t0 = _context6["catch"](4);
                                console.error("Unexpected error occurred:", _context6.t0);
                                res.status(500).json({
                                  err: "Unexpected error occurred"
                                });

                              case 20:
                              case "end":
                                return _context6.stop();
                            }
                          }
                        }, null, null, [[4, 16]]);
                      });
                      app.get("/posts", function _callee7(req, res) {
                        var posts, userIds, users, userMap, postsWithUser;
                        return regeneratorRuntime.async(function _callee7$(_context7) {
                          while (1) {
                            switch (_context7.prev = _context7.next) {
                              case 0:
                                console.log("Received request to /posts");
                                _context7.prev = 1;
                                _context7.next = 4;
                                return regeneratorRuntime.awrap(Postss.find());

                              case 4:
                                posts = _context7.sent;
                                userIds = posts.map(function (post) {
                                  return post.user;
                                });
                                _context7.next = 8;
                                return regeneratorRuntime.awrap(userr.find({
                                  userId: {
                                    $in: userIds
                                  }
                                }));

                              case 8:
                                users = _context7.sent;
                                userMap = users.reduce(function (map, user) {
                                  map[user.userId] = user;
                                  return map;
                                }, {});
                                postsWithUser = posts.map(function (post) {
                                  return _objectSpread({}, post._doc, {
                                    user: userMap[post.user]
                                  });
                                });
                                console.log("Posts with user data:", postsWithUser);
                                res.json(postsWithUser);
                                _context7.next = 19;
                                break;

                              case 15:
                                _context7.prev = 15;
                                _context7.t0 = _context7["catch"](1);
                                console.error("Error fetching posts:", _context7.t0);
                                res.status(500).send(_context7.t0);

                              case 19:
                              case "end":
                                return _context7.stop();
                            }
                          }
                        }, null, null, [[1, 15]]);
                      });
                      app.get("/search", function _callee8(req, res) {
                        var query, users;
                        return regeneratorRuntime.async(function _callee8$(_context8) {
                          while (1) {
                            switch (_context8.prev = _context8.next) {
                              case 0:
                                query = req.query.query;

                                if (query) {
                                  _context8.next = 3;
                                  break;
                                }

                                return _context8.abrupt("return", res.status(400).json({
                                  error: "Query parameter is required"
                                }));

                              case 3:
                                _context8.prev = 3;
                                _context8.next = 6;
                                return regeneratorRuntime.awrap(userr.find({
                                  username: {
                                    $regex: query,
                                    $options: "i"
                                  }
                                }, 'username userId'));

                              case 6:
                                users = _context8.sent;
                                res.status(200).json(users);
                                _context8.next = 14;
                                break;

                              case 10:
                                _context8.prev = 10;
                                _context8.t0 = _context8["catch"](3);
                                console.error("Error fetching search results:", _context8.t0);
                                res.status(500).json({
                                  error: "Failed to fetch search results"
                                });

                              case 14:
                              case "end":
                                return _context8.stop();
                            }
                          }
                        }, null, null, [[3, 10]]);
                      });
                      app.post("/send-message", function _callee9(req, res) {
                        var _req$body4, receiverId, content, mediaUrl, senderId, newMessage, conversation;

                        return regeneratorRuntime.async(function _callee9$(_context9) {
                          while (1) {
                            switch (_context9.prev = _context9.next) {
                              case 0:
                                _req$body4 = req.body, receiverId = _req$body4.receiverId, content = _req$body4.content, mediaUrl = _req$body4.mediaUrl;
                                senderId = req.headers['x-user-id']; // Assuming user ID is sent in this header

                                if (senderId) {
                                  _context9.next = 4;
                                  break;
                                }

                                return _context9.abrupt("return", res.status(400).json({
                                  error: "Sender ID is required"
                                }));

                              case 4:
                                _context9.prev = 4;
                                newMessage = new Message({
                                  sender: senderId,
                                  receiver: receiverId,
                                  content: content,
                                  mediaUrl: mediaUrl
                                });
                                _context9.next = 8;
                                return regeneratorRuntime.awrap(newMessage.save());

                              case 8:
                                _context9.next = 10;
                                return regeneratorRuntime.awrap(Conversation.findOne({
                                  participants: {
                                    $all: [senderId, receiverId]
                                  }
                                }));

                              case 10:
                                conversation = _context9.sent;

                                if (!conversation) {
                                  conversation = new Conversation({
                                    participants: [senderId, receiverId],
                                    latestMessage: newMessage._id
                                  });
                                } else {
                                  conversation.latestMessage = newMessage._id;
                                }

                                _context9.next = 14;
                                return regeneratorRuntime.awrap(conversation.save());

                              case 14:
                                res.status(200).json(newMessage);
                                _context9.next = 20;
                                break;

                              case 17:
                                _context9.prev = 17;
                                _context9.t0 = _context9["catch"](4);
                                res.status(500).json({
                                  error: "Failed to send message"
                                });

                              case 20:
                              case "end":
                                return _context9.stop();
                            }
                          }
                        }, null, null, [[4, 17]]);
                      });
                      app.get('/conversations/:userId', function _callee10(req, res) {
                        var userId, objectId, conversations;
                        return regeneratorRuntime.async(function _callee10$(_context10) {
                          while (1) {
                            switch (_context10.prev = _context10.next) {
                              case 0:
                                _context10.prev = 0;
                                userId = req.params.userId; // Validate if userId is a valid ObjectId

                                if (ObjectId.isValid(userId)) {
                                  _context10.next = 4;
                                  break;
                                }

                                return _context10.abrupt("return", res.status(400).json({
                                  error: 'Invalid user ID format'
                                }));

                              case 4:
                                objectId = new ObjectId(userId);
                                _context10.next = 7;
                                return regeneratorRuntime.awrap(Conversation.find({
                                  participants: objectId
                                }).populate('participants').populate('latestMessage'));

                              case 7:
                                conversations = _context10.sent;
                                res.status(200).json(conversations);
                                _context10.next = 15;
                                break;

                              case 11:
                                _context10.prev = 11;
                                _context10.t0 = _context10["catch"](0);
                                console.error('Failed to fetch conversations:', _context10.t0);
                                res.status(500).json({
                                  error: 'Failed to fetch conversations'
                                });

                              case 15:
                              case "end":
                                return _context10.stop();
                            }
                          }
                        }, null, null, [[0, 11]]);
                      });
                      app.get("/messages/:conversationId", function _callee11(req, res) {
                        var conversationId, messages;
                        return regeneratorRuntime.async(function _callee11$(_context11) {
                          while (1) {
                            switch (_context11.prev = _context11.next) {
                              case 0:
                                conversationId = req.params.conversationId;
                                _context11.prev = 1;
                                _context11.next = 4;
                                return regeneratorRuntime.awrap(Message.find({
                                  conversation: conversationId
                                }).sort({
                                  createdAt: 1
                                }));

                              case 4:
                                messages = _context11.sent;
                                res.status(200).json(messages);
                                _context11.next = 11;
                                break;

                              case 8:
                                _context11.prev = 8;
                                _context11.t0 = _context11["catch"](1);
                                res.status(500).json({
                                  error: "Failed to fetch messages"
                                });

                              case 11:
                              case "end":
                                return _context11.stop();
                            }
                          }
                        }, null, null, [[1, 8]]);
                      });

                    case 25:
                    case "end":
                      return _context12.stop();
                  }
                }
              });
            });
          } catch (err) {
            console.error(err);
          }

        case 8:
        case "end":
          return _context13.stop();
      }
    }
  });
};

connectToDatabase();