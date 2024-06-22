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
  allowedHeaders: ["Content-Type"],
  credentials: true
}));
var gridfsBucket;
mongoose.set("strictQuery", false);

var connectToDatabase = function connectToDatabase() {
  var http, socketIO, server, io, PORT, conn;
  return regeneratorRuntime.async(function connectToDatabase$(_context12) {
    while (1) {
      switch (_context12.prev = _context12.next) {
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
            conn.once("open", function _callee11() {
              var client, db, storage, upload;
              return regeneratorRuntime.async(function _callee11$(_context11) {
                while (1) {
                  switch (_context11.prev = _context11.next) {
                    case 0:
                      console.log("MongoDB connection opened");
                      client = new MongoClient("mongodb+srv://Admin:Shekar3999@Cluster1.rnlp84v.mongodb.net/", {
                        useNewUrlParser: true,
                        useUnifiedTopology: true
                      });
                      _context11.next = 4;
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
                        var _req$body, username, password, user;

                        return regeneratorRuntime.async(function _callee2$(_context2) {
                          while (1) {
                            switch (_context2.prev = _context2.next) {
                              case 0:
                                _req$body = req.body, username = _req$body.username, password = _req$body.password;
                                _context2.prev = 1;
                                _context2.next = 4;
                                return regeneratorRuntime.awrap(userr.findOne({
                                  username: username,
                                  password: password
                                }));

                              case 4:
                                user = _context2.sent;

                                if (user) {
                                  res.send({
                                    user: user
                                  });
                                } else {
                                  res.json("notexist");
                                }

                                _context2.next = 11;
                                break;

                              case 8:
                                _context2.prev = 8;
                                _context2.t0 = _context2["catch"](1);
                                res.json("catch error");

                              case 11:
                              case "end":
                                return _context2.stop();
                            }
                          }
                        }, null, null, [[1, 8]]);
                      });
                      app.post("/Signup", function _callee3(req, res) {
                        var _req$body2, username, password, userId, createdAt, data, existingUser;

                        return regeneratorRuntime.async(function _callee3$(_context3) {
                          while (1) {
                            switch (_context3.prev = _context3.next) {
                              case 0:
                                _req$body2 = req.body, username = _req$body2.username, password = _req$body2.password, userId = _req$body2.userId, createdAt = _req$body2.createdAt;
                                data = {
                                  username: username,
                                  password: password,
                                  userId: userId,
                                  createdAt: createdAt
                                };
                                _context3.prev = 2;
                                _context3.next = 5;
                                return regeneratorRuntime.awrap(userr.findOne({
                                  username: username
                                }));

                              case 5:
                                existingUser = _context3.sent;

                                if (!existingUser) {
                                  _context3.next = 10;
                                  break;
                                }

                                res.json("exist");
                                _context3.next = 13;
                                break;

                              case 10:
                                _context3.next = 12;
                                return regeneratorRuntime.awrap(userr.insertMany([data]));

                              case 12:
                                res.json("not exist");

                              case 13:
                                _context3.next = 18;
                                break;

                              case 15:
                                _context3.prev = 15;
                                _context3.t0 = _context3["catch"](2);
                                res.json("catch error");

                              case 18:
                              case "end":
                                return _context3.stop();
                            }
                          }
                        }, null, null, [[2, 15]]);
                      }); // Apply the middleware to all routes that require authentication
                      // app.use(authenticateUser);

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
                                if (gridfsBucket) {
                                  _context6.next = 3;
                                  break;
                                }

                                console.error("GridFSBucket not initialized");
                                return _context6.abrupt("return", res.status(500).json({
                                  err: "GridFSBucket not initialized"
                                }));

                              case 3:
                                _context6.prev = 3;
                                filesCursor = gridfsBucket.find({
                                  filename: req.params.filename
                                });
                                _context6.next = 7;
                                return regeneratorRuntime.awrap(filesCursor.toArray());

                              case 7:
                                files = _context6.sent;

                                if (!(!files || files.length === 0)) {
                                  _context6.next = 10;
                                  break;
                                }

                                return _context6.abrupt("return", res.status(404).json({
                                  err: "No file exists"
                                }));

                              case 10:
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
                                  res.status(404).json({
                                    err: "Not a supported media type"
                                  });
                                }

                                _context6.next = 17;
                                break;

                              case 14:
                                _context6.prev = 14;
                                _context6.t0 = _context6["catch"](3);
                                res.status(500).json({
                                  err: "Unexpected error occurred"
                                });

                              case 17:
                              case "end":
                                return _context6.stop();
                            }
                          }
                        }, null, null, [[3, 14]]);
                      });
                      app.get("/posts", function _callee7(req, res) {
                        var posts, userIds, users, userMap, postsWithUser;
                        return regeneratorRuntime.async(function _callee7$(_context7) {
                          while (1) {
                            switch (_context7.prev = _context7.next) {
                              case 0:
                                _context7.prev = 0;
                                _context7.next = 3;
                                return regeneratorRuntime.awrap(Postss.find());

                              case 3:
                                posts = _context7.sent;
                                userIds = posts.map(function (post) {
                                  return post.user;
                                });
                                _context7.next = 7;
                                return regeneratorRuntime.awrap(userr.find({
                                  userId: {
                                    $in: userIds
                                  }
                                }));

                              case 7:
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
                                res.json(postsWithUser);
                                _context7.next = 16;
                                break;

                              case 13:
                                _context7.prev = 13;
                                _context7.t0 = _context7["catch"](0);
                                res.status(500).send(_context7.t0);

                              case 16:
                              case "end":
                                return _context7.stop();
                            }
                          }
                        }, null, null, [[0, 13]]);
                      });
                      app.post("/send-message", function _callee8(req, res) {
                        var _req$body4, receiverId, content, mediaUrl, senderId, newMessage, conversation;

                        return regeneratorRuntime.async(function _callee8$(_context8) {
                          while (1) {
                            switch (_context8.prev = _context8.next) {
                              case 0:
                                _req$body4 = req.body, receiverId = _req$body4.receiverId, content = _req$body4.content, mediaUrl = _req$body4.mediaUrl;
                                senderId = req.user._id;
                                _context8.prev = 2;
                                newMessage = new Message({
                                  sender: senderId,
                                  receiver: receiverId,
                                  content: content,
                                  mediaUrl: mediaUrl
                                });
                                _context8.next = 6;
                                return regeneratorRuntime.awrap(newMessage.save());

                              case 6:
                                _context8.next = 8;
                                return regeneratorRuntime.awrap(Conversation.findOne({
                                  participants: {
                                    $all: [senderId, receiverId]
                                  }
                                }));

                              case 8:
                                conversation = _context8.sent;

                                if (!conversation) {
                                  conversation = new Conversation({
                                    participants: [senderId, receiverId],
                                    latestMessage: newMessage._id
                                  });
                                } else {
                                  conversation.latestMessage = newMessage._id;
                                }

                                _context8.next = 12;
                                return regeneratorRuntime.awrap(conversation.save());

                              case 12:
                                res.status(200).json(newMessage);
                                _context8.next = 18;
                                break;

                              case 15:
                                _context8.prev = 15;
                                _context8.t0 = _context8["catch"](2);
                                res.status(500).json({
                                  error: "Failed to send message"
                                });

                              case 18:
                              case "end":
                                return _context8.stop();
                            }
                          }
                        }, null, null, [[2, 15]]);
                      });
                      app.get("/conversations", function _callee9(req, res) {
                        var userId, conversations;
                        return regeneratorRuntime.async(function _callee9$(_context9) {
                          while (1) {
                            switch (_context9.prev = _context9.next) {
                              case 0:
                                userId = req.user._id; //STOPPING HERE SHEkAR CAREFULL

                                _context9.prev = 1;
                                _context9.next = 4;
                                return regeneratorRuntime.awrap(Conversation.find({
                                  participants: userId
                                }).populate('latestMessage').exec());

                              case 4:
                                conversations = _context9.sent;
                                res.status(200).json(conversations);
                                _context9.next = 11;
                                break;

                              case 8:
                                _context9.prev = 8;
                                _context9.t0 = _context9["catch"](1);
                                res.status(500).json({
                                  error: "Failed to fetch conversations"
                                });

                              case 11:
                              case "end":
                                return _context9.stop();
                            }
                          }
                        }, null, null, [[1, 8]]);
                      });
                      app.get("/messages/:conversationId", function _callee10(req, res) {
                        var conversationId, messages;
                        return regeneratorRuntime.async(function _callee10$(_context10) {
                          while (1) {
                            switch (_context10.prev = _context10.next) {
                              case 0:
                                conversationId = req.params.conversationId;
                                _context10.prev = 1;
                                _context10.next = 4;
                                return regeneratorRuntime.awrap(Message.find({
                                  conversation: conversationId
                                }).sort({
                                  createdAt: 1
                                }));

                              case 4:
                                messages = _context10.sent;
                                res.status(200).json(messages);
                                _context10.next = 11;
                                break;

                              case 8:
                                _context10.prev = 8;
                                _context10.t0 = _context10["catch"](1);
                                res.status(500).json({
                                  error: "Failed to fetch messages"
                                });

                              case 11:
                              case "end":
                                return _context10.stop();
                            }
                          }
                        }, null, null, [[1, 8]]);
                      });

                    case 21:
                    case "end":
                      return _context11.stop();
                  }
                }
              });
            });
          } catch (err) {
            console.error(err);
          }

        case 8:
        case "end":
          return _context12.stop();
      }
    }
  });
};

connectToDatabase();