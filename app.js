require("dotenv").config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env"
});
require('./config/database');

const express = require("express");
const session = require('express-session')
const morgan = require('morgan')
const cors = require('cors');
cors({credentials: true, origin: true})
const cookieParser = require('cookie-parser')

var createError = require('http-errors');

class AppController {
  constructor() {
    this.express = express();
    this.middlewares();
    this.routes();
    console.log(`Listening port ${process.env.PORT}...`)
  }

  middlewares() {
    this.express.use(cookieParser());
    this.express.use(session({ secret: process.env.COOKIE_SECRET }));
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