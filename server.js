const dbUrl = 'mongodb://digvijayyelve111:Migitizer1@ds123752.mlab.com:23752/insta';


//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
const http = require('http');
const path = require('path');
//express related
const express = require('express');
const bodyParser = require('body-parser');
//session
const session = require('express-session');  
const mongoSession = require('connect-mongodb-session')(session);
const passport = require('passport');
const userAuth = require('./userAuth.js');
const hash = require('./utils/hash.js');
//database
const mongoose = require('mongoose');
const Post = require('./models/Post.js');
const User = require('./models/User.js');
const PasswordReset = require('./models/PasswordReset.js'); 
//sendmail
const email = require('./utils/sendmail.js');
//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var router = express();
var server = http.createServer(router);


router.use(express.static(path.resolve(__dirname, 'Client')));

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

mongoose.connect(dbUrl);
//create a sessions collection as well
var mongoSessionStore = new mongoSession({
    uri: dbUrl,
    collection: 'sessions'
});

router.use(session({
  secret: process.env.SESSION_SECRET || 'mySecretKey', 
  store: mongoSessionStore,
  resave: true,
  saveUninitialized: false
}));

//add passport for authentication support
router.use(passport.initialize());
router.use(passport.session());
userAuth.init(passport);

router.get('/', function(req, res){
  console.log('Client requests root');
  //use sendfile to send our signin.html file
  res.sendFile(path.join(__dirname, 'Client/view','signin.html'));
});

//tell the router how to handle a get request to the signin page
router.get('/signin', function(req, res){
  console.log('Client requests signin');
  res.redirect('/');
});

router.get('/join', function(req, res){
  console.log('Client requests join');
  res.sendFile(path.join(__dirname, 'Client/view', 'join.html'));
});

router.post('/join', function(req, res, next) {
  passport.authenticate('signup', function(err, user, info) {
    if (err){
      res.json({isValid: false, message: 'internal error'});    
    } else if (!user) {
      res.json({isValid: false, message: 'try again'});
    } else {
      //log this user in since they've just joined
      req.logIn(user, function(err){
        if (!err)
          //send a message to the Client to say so
          res.json({isValid: true, message: 'welcome ' + user.email});
      });
    }
  })(req, res, next);
});

router.post('/signin', function(req, res, next) {
  //tell passport to attempt to authenticate the login
  passport.authenticate('login', function(err, user, info) {
    //callback returns here
    if (err){
      //if error, say error
      res.json({isValid: false, message: 'internal error'});
    } else if (!user) {
      //if no user, say invalid login
      res.json({isValid: false, message: 'try again'});
    } else {
      //log this user in
      req.logIn(user, function(err){
        if (!err)
          //send a message to the Client to say so
          res.json({isValid: true, message: 'welcome ' + user.email});
      });
    }
  })(req, res, next);
});

router.get('/posts', userAuth.isAuthenticated, function(req, res){
  console.log('Client requests posts.html');
  //use sendfile to send our posts.html file
  res.sendFile(path.join(__dirname, 'Client/view','posts.html'));
  console.log(req.session.passport.user);
})

//tell the router how to handle a post request to /posts
//only do this if this is an authenticated user
router.post('/posts', userAuth.isAuthenticated, function(req, res){
  console.log('Client requests posts list');
  
  //go find all the posts in the database
  Post.find({})
  .then(function(paths){
    //send them to the Client in JSON format
    res.json(paths);
  })
});

//tell the router how to handle a post request to /incrLike
router.post('/incrLike', userAuth.isAuthenticated, function(req, res){
  console.log('increment like for ' + req.body.id);

  //go get the post record
  Post.findById(req.body.id)
  .then(function(post){
    //increment the like count
    post.likeCount++;
    //save the record back to the database
    return post.save(post);
  })
  .then(function(post){
    //a successful save returns back the updated object
    res.json({id: req.body.id, count: post.likeCount});  
  })
  .catch(function(err){
    console.log(err);
  })
});

router.get('/passwordreset', (req, res) => {
  console.log('Client requests passwordreset');
  res.sendFile(path.join(__dirname, 'Client/view', 'passwordreset.html'));
});

router.post('/passwordreset', (req, res) => {
    Promise.resolve()
    .then(function(){
        //see if there's a user with this email
        return User.findOne({'email' : req.body.email});
    })
    .then(function(user){
      if (user){
        var pr = new PasswordReset();
        pr.userId = user.id;
        pr.password = hash.createHash(req.body.password);
        pr.expires = new Date((new Date()).getTime() + (20 * 60 * 1000));
        pr.save()
        .then(function(pr){
          if (pr){
            email.send(req.body.email, 'password reset', 'https://prog8165-rtbsoft.c9users.io/verifypassword?id=' + pr.id);
          }
        });
      }
    })
});

router.get('/verifypassword', function(req, res){
    var password;
    
    Promise.resolve()
    .then(function(){
      return PasswordReset.findOne({id: req.body.id});
    })
    .then(function(pr){
      if (pr){
        if (pr.expires > new Date()){
          password = pr.password;
          //see if there's a user with this email
          return User.findOne({id : pr.userId});
        }
      }
    })
    .then(function(user){
      if (user){
        user.password = password;
        return user.save();
      }
    })
});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});
