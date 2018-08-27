var express = require('express');
var path = require('path');
var logger = require('morgan');
const bodyparser = require('body-parser');

const passport = require("passport");

var app = express();


const port = process.env.port || 8042;

app.use(logger('dev'));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
    extended: true
}));

//======================== configs =================
require("./app/configs/passport")(passport);
require("./app/configs/database")();

//======================== routes ==================
require("./app/routes/users")(app);

app.listen(port);
console.log("app listen on port " + port);

module.exports = app;
