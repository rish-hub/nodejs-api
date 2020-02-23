const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");
const axios = require('axios');
const mongoose = require('mongoose');
const auth = require('./../../middleware/auth')
// Db string 
const db = config.get('mongoUri');

// User Model
const User = require("../../models/User");
const PostsSchema = require("../../models/Posts");

// @route Get api/User
// @Dec   Get all details of the loggedin User
// @access Private
router.get("/", auth, (req, res) => {
  const { user } = req;

  let userId = user.id;
  const connStr = `${db}` + '/master'
  mongoose.connect(connStr, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
  }).then(() => {
    User.find({ id: userId }).then(users => {
      mongoose.connection.close();
      return res.json(users)
    });
  });
});

// @route Get api/user/posts
// @Dec   Get all posts of the loggedin User
// @access Private
router.get("/posts", auth, (req, res) => {
  const { user } = req;
  let username = user.username;
  username = username.replace(' ', '_').replace('.', '_');
  const connStr = `${db}` + '/' + username
  mongoose.connect(connStr, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
  }).then(() => {
    PostsSchema.find({}).then(posts => {
      mongoose.connection.close();
      return res.json(posts)
    });
  });
});

// @route Get api/user/allUsers
// @Dec   Get all Users details  
// @access Private only admin
router.get("/allUsers", auth, (req, res) => {
  const { user } = req;

  let role = user.role;
  if (role === 'admin') {
    const connStr = `${db}` + '/master'
    mongoose.connect(connStr, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true
    }).then(() => {
      User.find({}).then(users => {
        mongoose.connection.close();
        return res.json(users)
      });
    });
  } else {
    return res.status(403).json('Action not allowed');
  }
});

const getAllUserName = () => {
  const connStr = `${db}` + '/master'
  return mongoose.connect(connStr, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
  }).then(() => {
    return User.find({}).select('username').then(usernames => {
      mongoose.connection.close();
      return usernames;
    })
  })
}
const getAllPosts = (usernames) => {
  return usernames.map(username => {
    let usr = username.username.replace(' ', '_').replace('.', '_');
    const connStr = `${db}` + '/' + usr;
    return mongoose.connect(connStr, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true
    }).then(() => {
      return PostsSchema.find({}).then(_p => {
        mongoose.connection.close();
        return _p;
      })
    })
  })
}


// @route Get api/user/allposts
// @Dec   Get all Users details  
// @access Private only admin
router.get("/allposts", auth, async (req, res) => {
  const { user } = req;
  let role = user.role;
  if (role === 'admin') {
    let usernames = await getAllUserName();
    let AllPosts = await getAllPosts(usernames);
    Promise.all(AllPosts).then(function (_posts) {
      return res.json(..._posts)
    });
  } else {
    return res.status(403).json('Action not allowed');
  }
});

// @Fetch api/User
const fetchUsers = () => {
  return axios.get('http://jsonplaceholder.typicode.com/users')
    .then(function (res) {
      return res.data;
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
}
// @Fetch api/posts
const fetchPosts = () => {
  return axios.get('http://jsonplaceholder.typicode.com/posts')
    .then(function (res) {
      return res.data;
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
}
// @Fetch api/comments
const fetchComments = () => {
  return axios.get('http://jsonplaceholder.typicode.com/comments')
    .then(function (res) {
      return res.data;
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
}
const connect = (dbName) => {
  const connStr = `${db}` + '/' + `${dbName}`
  mongoose.connect(connStr, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
  }).then(() => {
    console.log(`Connection initiated: ${dbName} `)
  }).catch(err => console.log(err))
}

// @route Fetch api/User
// @Dec   Fetch and Create Users from URL
// ###    http://jsonplaceholder.typicode.com/users
// @access Public
router.get("/fetchUsers", async (req, res) => {

  const userData = await fetchUsers();
  if (userData && userData.length) {
    userData.forEach(user => {
      //connect mongodb
      const connStr = `${db}` + '/master'
      mongoose.connect(connStr, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
      }).then(() => {
        return User.find({ username: user.username }).then(usr => {
          if (!usr.length) {
            const newUser = new User(user);
            newUser.password = user.username;
            // Salt and hash it
            bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;
                newUser.password = hash;
                newUser
                  .save()
                  .then(() => {
                    return mongoose.connection.close();
                  })
                  .catch(err => res.status(400));
              });
            });

          }
        });
      }).catch(err => console.log(err))
    })
    return res.json('success');
  } else {
    mongoose.connection.close();
    return res.status(400).json('error');
  }
});

// @route Fetch api/Post And comments
// @Dec   Fetch and Create Users from URL
// ###    http://jsonplaceholder.typicode.com/posts
// ###    http://jsonplaceholder.typicode.com/comments
// @access Public
router.get("/fetchPostsComments", async (req, res) => {
  // fetch all posts
  let _Posts = await fetchPosts();

  // fetch all Comments
  const Comments = await fetchComments();

  // map comments to Posts
  const AllPosts = [];
  _Posts.forEach(p => {
    let pObj = { ...p };
    let Allcomments = Comments.filter(com => com.postId === pObj.id);
    pObj.comments = Allcomments
    AllPosts.push(pObj);
  });

  //connect mongodb 
  connect('master');
  // get users from db
  User.find({}).select('id username').then(userData => {
    mongoose.connection.close();

    if (userData && userData.length) {
      userData.forEach(user => {
        AllPosts.forEach(__post => {
          if (__post.userId === user.id) {
            //connect mongodb
            let dbName = user.username.replace(" ", "_").replace(".", "_");
            const connStr = `${db}` + '/' + `${dbName}`
            mongoose.connect(connStr, {
              useNewUrlParser: true,
              useCreateIndex: true,
              useUnifiedTopology: true
            }).then(() => {

              const Posts = new PostsSchema(__post);
              Posts.save().then(() => {
                mongoose.connection.close();
              });
            }).catch(err => console.log(err))

          }
        })
      })
      return res.json('success');
    }
  })
});


module.exports = router;
