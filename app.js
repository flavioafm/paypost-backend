// require("dotenv").config({
//   path: process.env.NODE_ENV === "test" ? ".env.test" : ".env"
// });
// var createError = require('http-errors');
// var express = require('express');
// var path = require('path');
// var cookieParser = require('cookie-parser');
// var logger = require('morgan');
// require('./config/database');

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

// var app = express();

// // view engine setup
// //app.set('views', path.join(__dirname, 'views'));
// //app.set('view engine', 'jade');
// const authMiddleware = require('./middlewares/auth')

// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500).send({error: err.message});
//   //res.render('error');
// });

// module.exports = app;

require("dotenv").config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env"
});
require('./config/database');

const express = require("express");
const morgan = require('morgan')
const cors = require('cors');
cors({credentials: true, origin: true})

var createError = require('http-errors');

class AppController {
  constructor() {
    this.express = express();
    this.middlewares();
    this.routes();
    console.log(`Listening port ${process.env.PORT}...`)
  }

  middlewares() {
    this.express.use(cors());
    this.express.use(express.json());
    this.express.use(morgan('dev'));

  }

  routes() {
    const {openRoutes, protectedRoutes} = require("./routes");
    this.express.use(openRoutes);
    this.express.use(protectedRoutes);

    this.express.use(function(req, res, next) {
      next(createError(404));
    });

    // error handler
    this.express.use(function(err, req, res, next) {
      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};

      res.status(err.status || 500).send({error: err.message});
    });


  }
}

module.exports = new AppController().express;