var express = require('express');
var path = require('path');
var logger = require('morgan');



var app = express();


const port = process.env.port || 3000;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//======================== configs =================
require("./app/configs/passport")();
require("./app/configs/database")();

//======================== routes ==================
require("./app/routes/users")(app);

app.listen(port);
console.log("app listen on port " + port);

module.exports = app;
