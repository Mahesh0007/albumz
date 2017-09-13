var express = require('express');
var router = express.Router();
var firebase = require('firebase');
var fbRef = firebase.database().ref();

router.get('/register',function(req,res,next){
  res.render('users/register');
});

router.get('/login',function(req,res,next){
  res.render('users/login');
});

router.post('/register',function(req,res,next){
  var first_name = req.body.first_name;
  var last_name = req.body.last_name;
  var email = req.body.email;
  var password = req.body.password;
  var password2 = req.body.password2;
  var location = req.body.location;
  var fav_artists = req.body.fav_artists;
  var fav_genres = req.body.fav_genres;

req.checkBody('first_name','First name is Rquired').notEmpty();
req.checkBody('email',' email is Rquired').notEmpty();
req.checkBody('email','email  is Not Valid').isEmail();
req.checkBody('password',' password is Rquired').notEmpty();
req.checkBody('password2','password do not match!').equals(req.body.password);
var errors = req.validationErrors();
if(errors){
  res.render('users/register',{
    errors:errors
  });
}else{
  firebase.auth().createUserWithEmailAndPassword(email,password).then(function(userData)
  {
    console.log("Successfully Created user with uid:",userData.uid);
      var user ={
        uid:userData.uid,
        email:email,
        first_name:first_name,
        last_name:last_name,
        location:location,
        fav_genres:fav_genres,
        fav_artists:fav_artists
      }
      var userRef =fbRef.child('users');
      userRef.push().set(user);
    req.flash('success_msg','you are registered now, You can login');
    res.redirect('/users/login');
  }).catch(function(error)
  {
    res.write
    ({
      code: error.code
    });
    res.status(401).end();
  });
}
});


router.post('/login',function(req,res,next){
  var email = req.body.email;
  var password = req.body.password;

req.checkBody('email',' email is Rquired').notEmpty();
req.checkBody('email','email  is Not Valid').isEmail();
req.checkBody('password',' password is Rquired').notEmpty();

var errors = req.validationErrors();
if(errors){
  res.render('users/login',{
    errors:errors
  });
}else{
  firebase.auth().signInWithEmailAndPassword(email,password).then(function(authData)
  {
    console.log(" user logged in successfully:");

    req.flash('success_msg','you are logged in Now!!');
    res.redirect('/albums');
  }).catch(function(error)
  {
    var errorCode = error.code;
    var errorMessage = error.message;
    if (errorCode === 'auth/wrong-password') {
      req.flash('error_msg','Wrong Password!');
      res.redirect('/users/login');
    } else {
      req.flash('not_registered_user_msg',errorMessage);
      res.redirect('/users/login');
    }
    console.log(error);
  });
}
});

router.get('/logout',function(req,res) {
  firebase.auth().signOut();
  req.flash('success_msg','You are Logged out., Login again!');
  res.redirect('/users/login');
})

module.exports = router;
