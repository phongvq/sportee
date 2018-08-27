var express = require('express');
var path = require('path');
var logger = require('morgan');

var responseFormatter = require('express-response-formatter')

const bodyparser = require('body-parser');

const passport = require("passport");

var app = express();

const port = process.env.port || 8042;

app.use(responseFormatter())
app.use(logger('dev'));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
    extended: true
}));
require("./app/configs/passport")(passport);
app.use(passport.initialize())
//======================== configs =================

require("./app/configs/database")();

//======================== routes ==================
require("./app/routes/users")(app);
require("./app/routes/sportcenter")(app)
app.listen(port);
console.log("app listen on port " + port);

module.exports = app;
