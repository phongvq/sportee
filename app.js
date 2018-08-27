var express = require('express');
var path = require('path');
var logger = require('morgan');
var responseFormatter = require('express-response-formatter')
var app = express();


const port = process.env.port || 3000;

app.use(responseFormatter())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


require("./app/routes/users")(app);

app.listen(port);
console.log("app listen on port " + port);

module.exports = app;
