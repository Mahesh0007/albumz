var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session= require('express-session');
var expressValidator= require('express-validator');
var flash= require('connect-flash');
var firebase = require('firebase');

var config = {
  apiKey: "AIzaSyDGxnSCVQmqvlGjBLmz25S4Kya735A0ZUE",
  authDomain: "albumz01-9be2e.firebaseapp.com",
  databaseURL: "https://albumz01-9be2e.firebaseio.com/"
};

firebase.initializeApp(config);

var fbRef = firebase.database().ref();

//Route files
var routes = require('./routes/index');
var albums = require('./routes/albums');
var genres = require('./routes/genres');
var users  = require('./routes/users');

var app=express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser());

app.use(session({
  secret :'secret',
  saveUninitialized : true,
  resave:true
}));

app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var   namespace = param.split('.'),
            root      = namespace.shift(),
            formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(flash());

app.use(function(req,res,next){
  res.locals.success_msg=req.flash('success_msg');
  res.locals.error_msg=req.flash('error_msg');
  res.locals.not_registered_user_msg=req.flash('not_registered_user_msg');
  res.locals.authdata = firebase.auth().currentUser;
  res.locals.page = req.url;
  next();
});
//Get user info
app.get('*',function(req,res,next){

  if(firebase.auth().currentUser!=null){
  var id = firebase.auth().currentUser.uid;
  var profileRef = fbRef.child('users');
  // order by uid and then find the specific uid
  var query = profileRef.orderByChild('uid').equalTo(id);
  query.once('value',function(snapshot){
    snapshot.forEach(function(childSnapshot){
      var key = childSnapshot.key;
      var childData = childSnapshot.val();
    //  console.log("childSnapshot.val is: "+childSnapshot.val());
    var user =snapshot.child('query/key').val();
    console.log('key is : '+key);
    console.log('user is : '+childData);
    res.locals.user = childData;
    next();
    });
  });
}else{
next();
}
});

app.use('/', routes);
app.use('/albums',albums);
app.use('/genres',genres);
app.use('/users',users);

app.set('port',(process.env.PORT || 3000));

app.listen(app.get('port'),function(){
  console.log('Server started on port: '+app.get('port'));
});

module.exports = app;
