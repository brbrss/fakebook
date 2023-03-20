const createError = require('http-errors');
const express = require('express');
const path = require('path');


const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

{
  //middleware
  const cookieParser = require('cookie-parser');
  const logger = require('morgan');
  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

   //upload
   const fileUpload = require('express-fileupload');
   app.use(fileUpload({
     useTempFiles: true,
     tempFileDir: './tmp/'
   }));

  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.static(path.join(__dirname, 'upload')));
}



{
  //session
  const flash = require("connect-flash");
  app.use(flash());
  const session = require('express-session');
  const passport = require('passport');
  const MongoStore = require('connect-mongo');

  
  require('dotenv').config();
  const secret = process.env.SERVER_SECRET;
  app.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/book' })
  }));
  app.use(passport.authenticate('session'));
}
{
  //database
  const { MongoClient } = require("mongodb");
  const uri = "mongodb://localhost:27017";
  let client = new MongoClient(uri);
  require('./model/inject')(client);
}
{
  // router
  const indexRouter = require('./routes/index');
  const authRouter = require('./routes/credential');
  const userRouter = require('./routes/user');
  const postRouter = require('./routes/post');
  app.use('/', indexRouter);
  app.use('/credential', authRouter);
  app.use('/user', userRouter);
  app.use('/post', postRouter);
  //app.use('/upload',require('./routes/upload'));
}

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
