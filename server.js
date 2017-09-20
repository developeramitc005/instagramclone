/*
 *  Server.js
	Program converst Fahrenheit to Celsium and Celsium to Fahrenheit in custom ranges

        Revision History
            Amit Chavhan, Digvijay Yelve June 10, 2017 Created 
            Amit Chavhan,  Digvijay Yelve July 10, 2017 Modified and fixed all errors
*/


// Initilizaing modules
const path = require('path');

//express and body-parser modules
const express = require('express');
const bodyParser = require('body-parser');

//session
const session = require('express-session');
const mongoSession = require('connect-mongodb-session')(session);
const passport = require('passport');
const userAuth = require('./userAuth.js');
const hash = require('./utils/hash.js');
const Guid = require('guid');

//database
const mongoose = require('mongoose');
const Post = require('./models/Post.js');
const Like = require('./models/Like.js'); 
const User = require('./models/User.js');
const PasswordReset = require('./models/PasswordReset.js');
const dbUrl = 'mongodb://digvijayyelve111:Migitizer1@ds123752.mlab.com:23752/insta';

//sendmail
const email = require('./utils/sendmail.js');

const fileUpload = require('express-fileupload');

// instantiate express object
var router = express();


// including local html, css, js and many more directory paths into the project 
router.use(express.static(path.resolve(__dirname, 'Client')));

//including body-parser module for parsing json response 
router.use(bodyParser.urlencoded({
  extended: true
}));
router.use(bodyParser.json());

//directing mongoose to the database address
mongoose.connect(dbUrl);

//create a sessions collection as well
var mongoSessionStore = new mongoSession({
  uri: dbUrl,
  collection: 'sessions'
});

//including session setting and also secerte key for the user session
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
router.use(fileUpload());

// creating a handler to handle startup page(login, signup)
router.get('/', function(req, res) {
  console.log('Client requests root');
  //use sendfile to send our signin.html file
    res.sendFile(path.join(__dirname, 'Client/view', 'login.html'));
  
});

router.get('/demo', function(req, res) {
  console.log('Client requests root');
  //use sendfile to send our signin.html file
  res.sendFile(path.join(__dirname, 'Client/view', 'demo.html'));
});

//tell the router how to handle a get request to the signin page
router.get('/signin', function(req, res) {
  console.log('Client requests signin');
  res.redirect('/');
});



// handler for signup page
router.get('/join', function(req, res) {
  console.log('Client requests join');
  res.sendFile(path.join(__dirname, 'Client/view', 'register.html'));
});




// handler
router.post('/join', function(req, res, next) {
  passport.authenticate('signup', function(err, user, info) {
    if (err) {
      res.json({
        isValid: false,
        message: 'internal error'
      });
    }
    else if (!user) {
      res.json({
        isValid: false,
        message: 'Email is already used Please try again'
      });
    }
    else {
      //log this user in since they've just joined
      req.logIn(user, function(err) {
        if (!err)
        //send a message to the Client to say so
          res.json({
          isValid: true,
          message: 'welcome ' + user.email
        });
      });
    }
  })(req, res, next);
});




router.post('/signin', function(req, res, next) {
  //tell passport to attempt to authenticate the login
  passport.authenticate('login', function(err, user, info) {
    //callback returns here
    if (err) {
      //if error, say error
      res.json({
        isValid: false,
        message: err
      });
    }
    else if (!user) {
      //if no user, say invalid login
      res.json({
        isValid: false,
        message: 'Sorry, your password was incorrect. Please double-check your password.'
      });
    }
    else {
      //log this user in
      req.logIn(user, function(err) {
        if (!err)
        //send a message to the Client to say so
          //res.status(302).set('Location', req.query.next);
          res.json({
          isValid: true,
          message: 'welcome ' + user.email
        });
        
      });
    }
  })(req, res, next);
});


router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

router.post('/likeslist', function(req, res){
  console.log(req.body.id);
  Like.find({postId: req.body.id})
  .then(function(likes){
    res.json(likes);
  })
});


router.get('/posts', userAuth.isAuthenticated, function(req, res) {
  console.log('Client requests posts.html');
  //use sendfile to send our posts.html file
  if (req.isAuthenticated()) {
    res.sendFile(path.join(__dirname, 'Client/view', 'posts.html'));
    console.log(req.session.passport);


  }
  else {
    res.sendFile(path.join(__dirname, 'Client/view', 'signin.html'));
    console.log("user is invalid" + req.session.passport.user);
  }
})



//tell the router how to handle a post request to /posts
//only do this if this is an authenticated user
router.post('/posts', userAuth.isAuthenticated, function(req, res) {
  console.log('Client requests posts list');

  //go find all the posts in the database
  Post.find({}).sort({postTimeStamp : -1})
    .then(function(posts) {
      //send them to the Client in JSON format
      res.json(posts);
    })
});








//tell the router how to handle a post request to /incrLike
router.post('/incrLike', userAuth.isAuthenticated, function(req, res){
  console.log('increment like for ' + req.body.id + ' by user ' + req.user.email);
  
  Like.findOne({userId: req.user.id, postId: req.body.id})
  .then(function(like){
    if (!like){
      //go get the post record
      Post.findById(req.body.id)
      .then(function(post){
        //increment the like count
        post.likeCount++;
        //save the record back to the database
        return post.save(post);
      })
      .then(function(post){
        var like = new Like();
        like.userId = req.user.id;
        like.postId = req.body.id;
        like.userName = req.user.userName;
        like.save();
        
        //a successful save returns back the updated object
        res.json({id: req.body.id, count: post.likeCount});  
      })
    } else {
        // find like doc if user has liked the post
        like.remove()
        Post.findById(req.body.id)
        .then(function(post){
          //decrement the like count
          post.likeCount--
          //save the record back to the database
          post.save(post);
          res.json({id: req.body.id, count: post.likeCount});  
      })
        
    }
  })
  .catch(function(err){
    console.log(err);
  })
});

router.get('/passwordreset', (req, res) => {
  console.log('Client requests passwordreset');
  res.sendFile(path.join(__dirname, 'Client/view', 'resetpass.html'));
});

router.post('/passwordreset', (req, res) => {
  Promise.resolve()
    .then(function() {
      console.log(req.body.email);
      //see if there's a user with this email
      return User.findOne({
        'email': req.body.email
      });
    })
    .then(function(user) {
      if (user) {
        var pr = new PasswordReset();
        pr.userId = user.id;
        pr.password = hash.createHash(req.body.password);
        pr.expires = new Date((new Date()).getTime() + (20 * 60 * 1000));
        var addressString = '"https://prog8165-rtbsoft.c9users.io/verifypassword?id="'+ pr.id +'"';
        //console.log('To reset the password please <a href='+addressString+'>Please Click Here</a>')
        pr.save()
          .then(function(pr) {
            if (pr) {
              email.send(req.body.email, 'password reset', 
              '<b>Please Click the link to reset password</b><a href="https://update-instagram-amitc005.c9users.io/verifypassword?id=' + pr.id +"><button>click me</button></a>");
            }
          });
          res.send("Reset Email Has been sent to your Email");
      }else{
        res.send("User Does not Exist");
      }
    })
});

router.get('/verifypassword', function(req, res) {

  var password;
  
  Promise.resolve()
    .then(function() {
      
      return PasswordReset.findOne({
        id: req.body.id
      });
    })
    .then(function(pr) {
      console.log(pr)
      if (pr) {
        console.log("I am");
        if (pr.expires > new Date()) {
          password = pr.password;
          pr.remove();
          //see if there's a user with this email
          console.log("user : ");
          return User.findOne({
            _id: pr.userId
          });
        }
      }
    })
    .then(function(user) {
      console.log(user);
      if (user) {
        console.log("run4");
        user.password = password;
        user.save();
        
        res.redirect("/signin");
      }else{
        res.send("error");
      }
    })
});

router.listen(process.env.PORT, function() {
  console.log("Server has been started")
});


router.post("/upload", function(req, res) {
  
  if (req.isAuthenticated()) {
    var responseMessage = {
      success: "false",
      message: ""
    };
    if (req.files) {
      if (req.files.files.length) {
      }
      else {
        var fileObject = req.files.files;
        var guid = Guid.create();
        var extension = '';
        switch (fileObject.mimetype) {
          case 'image/jpeg':
            extension = '.jpg';
            break;
          case 'image/png':
            extension = '.png';
            break;
          case 'image/bmp':
            extension = '.bmp';
            break;
          case 'image/gif':
            extension = '.gif';
            break;
        }
        if (extension) {
          //construct the file name
          var filename = guid + extension;
          // Use the mv() method to place the file somewhere on your server 
          fileObject.mv('./Client/images/' + filename, function(err) {
            //if no error
            if (!err) {
              //create a post for this image
              var post = new Post();
              post.userId = req.user.id;
              post.image = './images/' + filename;
              post.likeCount = 0;
              post.comment = '';
              post.feedbackCount = 0;
              post.hasLiked ="";
              post.userName = req.user.userName;
              //save it
              post.save()
                .then(function() {
                  res.json({
                    success: true,
                    message: post
                  });
                })
            }
            else {
              responseMessage.message = 'internal error';
              res.json(responseMessage);
            }
          });
        }
        else {
          responseMessage.message = 'unsupported file type';
          res.json(responseMessage);
        }
      }
    }
    else {
      res.send(responseMessage.message = "No file has been uploaded")
    }
  }
  else {
    res.send("Unauthorized use")
  }
})


// handler for signup page
router.get('/demo', function(req, res) {
  console.log('Client requests join');
  res.sendFile(path.join(__dirname, 'Client/view', 'demo.html'));
});

router.get('/validateFormData', function(req, res) {
  
});