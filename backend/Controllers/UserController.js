require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const bodyParser = require('body-parser');
const userr = require("../models/User");
const Postss = require('../models/Posts');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());

let gfs;

const mongoURI = process.env.MONGO_URI;
mongoose.set('strictQuery', false);

const connectToDatabase = async () => {
  try {
    await mongoose.connect('mongodb+srv://Admin:Shekar3999@Cluster1.rnlp84v.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true });
    const conn = mongoose.connection;
    console.log("mongodb connected successfull")
    conn.once('open', () => {
      console.log('MongoDB connection opened');
      gfs = Grid(conn.db, mongoose.mongo);
      gfs.collection('uploads');
      console.log("GridFS initialized");

      // Create storage engine
      const storage = new GridFsStorage({
        url: mongoURI,
        options: { useNewUrlParser: true, useUnifiedTopology: true },
        file: (req, file) => {
          return {
            bucketName: 'uploads',
            filename: `${Date.now()}-${file.originalname}`,
          };
        },
      });
      const upload = multer({ storage });

      // Define routes here
      app.get("/", (req, res) => {
        res.send("App is Working");
      });

      app.post("/Login", async (req, res) => {
        const { username, password, userId } = req.body;
        try {
          const user = await userr.findOne({ password });
          if (user) {
            res.send({ user });
          } else {
            res.json("notexist");
          }
        } catch (e) {
          res.json("catch error");
        }
      });

      app.post('/Signup', async (req, res) => {
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
          res.json("cool shekar error");
        }
      });

      app.use('/image', express.static(path.join(__dirname, '..', 'uploads')));

      // Upload image route
      app.post('/upload', upload.single('file'), async (req, res) => {
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

      // Get all files
      app.get('/files', (req, res) => {
        if (!gfs) {
          return res.status(500).json({ err: 'gfs not initialized' });
        }
        gfs.files.find().toArray((err, files) => {
          if (err) {
            return res.status(500).json({ err: 'Error fetching files' });
          }
          if (!files || files.length === 0) {
            return res.status(404).json({ err: 'No files exist' });
          }
          return res.json(files);
        });
      });

      // Get single file by filename
      app.get('/files/:filename', (req, res) => {
        if (!gfs) {
          return res.status(500).json({ err: 'gfs not initialized' });
        }
        gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
          if (err) {
            return res.status(500).json({ err: 'Error fetching file' });
          }
          if (!file || file.length === 0) {
            return res.status(404).json({ err: 'No file exists' });
          }
          return res.json(file);
        });
      });

      // Display image
      app.get('/image/:filename', (req, res) => {
        if (!gfs) {
          return res.status(500).json({ err: 'gfs not initialized' });
        }
        gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
          if (err) {
            return res.status(500).json({ err: 'Error fetching image' });
          }
          if (!file || file.length === 0) {
            return res.status(404).json({ err: 'No file exists' });
          }

          if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
            const readstream = gfs.createReadStream(file.filename);
            readstream.on('error', err => {
              res.status(500).json({ err: 'Error reading file' });
            });
            readstream.pipe(res);
          } else {
            res.status(404).json({ err: 'Not an image' });
          }
        });
      });

      // Posts route
      app.get('/posts', async (req, res) => {
        try {
          const posts = await Postss.find();
          const userIds = posts.map(post => post.user);
          const users = await userr.find({ userId: { $in: userIds } });
          const userMap = users.reduce((map, user) => {
            map[user.userId] = user;
            return map;
          }, {});

          const postsWithUser = posts.map(post => ({
            ...post._doc,
            user: userMap[post.user],
          }));

          res.json(postsWithUser);
        } catch (err) {
          res.status(500).send(err);
        }
      });

      // Start the server
      const PORT = process.env.PORT || 8001;
      app.listen(PORT, () => {
        console.log('Listening on port', PORT);
        
      });
    });
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
};
connectToDatabase();

