var express = require('express');
var router = express.Router();
const passport = require("passport")
const userModel = require("./users")
const postModel = require("./post")
const localStrategy = require("passport-local")
const multer = require("./multer");
const upload = require('./multer');


passport.use(new localStrategy(userModel.authenticate()))
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index',{nav : false});
});
router.get('/register', function(req, res, next) {
  res.render('register', {nav : false});
});

router.get('/profile',isLoggedIn,async function(req, res, next) {
  const user = 
  await userModel
        .findOne({username : req.session.passport.user})
        .populate("posts")
          console.log(user);
  res.render('profile', {user, nav:true});
});


router.get('/show/posts',isLoggedIn,upload.single('image'),async function(req, res, next) {
  const user = 
  await userModel
        .findOne({username : req.session.passport.user})
        .populate("posts")
          console.log(user);
  res.render('show', {user, nav:true});
});

router.get('/feed',isLoggedIn,async function(req, res, next) {
  const user = await userModel.findOne({username : req.session.passport.user})
  const posts = await postModel.find()
   .populate("user")
  res.render('feed', {user,posts, nav:true});
});

router.get('/add',isLoggedIn,async function(req, res, next) {
  const user =await userModel.findOne({username : req.session.passport.user})
  res.render('add', {user, nav:true});
});

router.post('/createpost',isLoggedIn,upload.single("postimage"),async function(req, res, next) {
  const user = await userModel.findOne({username : req.session.passport.user})
  const post = await postModel.create({
    user : user._id,
    title  : req.body.title,
    discription : req.body.description,
    image : req.file.filename
  })
  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile")
});


router.post('/fileupload',isLoggedIn,upload.single('image'),async function(req, res, next) {
  const user = await userModel.findOne({username : req.session.passport.user})
  user.profileImage = req.file.filename;
  await user.save()
  res.redirect("back")
});



router.post('/login', passport.authenticate('local',{
  successRedirect : "/profile",
  failureRedirect : "/"
}),function(req,res,next){});


router.get("/logout",isLoggedIn,(req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})



router.post('/register', function(req, res, next) {
    var newUser = new userModel({
      username : req.body.username,
      name : req.body.name,
      email : req.body.email,
      contact : req.body.contact,
    });
    userModel.register(newUser , req.body.password)
    .then(function(u){
         passport.authenticate('local')(req,res, function(){
          res.redirect("/profile")
         })
    })
});



function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  else{
    res.redirect("/")
  }
}

module.exports = router;
