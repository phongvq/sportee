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

//============================error handler=======================
app.use(function (err, req, res, next) {
    console.log('next');
    console.log(err);
    var statusCode = err.statusCode || 500;
    var errRes = {
        detail: err.detail || err.message || err
    };
    console.log(errRes);
    switch (statusCode) {
        case 400:
            res.formatter.badRequest(errRes);
            break;
        case 401:
            res.formatter.unauthorized(errRes);
            break;
        case 403:
            res.formatter.forbidden(errRes);
            break;
        case 500:
            res.formatter.serverError(errRes);
            break;
        default:
            res.formatter.unprocess(errRes);
            break;
    }
});


app.listen(port);
console.log("app listen on port " + port);

module.exports = app;
