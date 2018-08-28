var express = require('express');
var path = require('path');
var logger = require('morgan');

var responseFormatter = require('express-response-formatter')

const bodyparser = require('body-parser');

const mongoose = require('mongoose');
const passport = require("passport");
const AWS = require('aws-sdk');


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

const awsConfig =  require("./app/configs/aws");
const creds = new AWS.Credentials({
    accessKeyId: awsConfig.cred.accessKeyId,
    secretAccessKey: awsConfig.cred.secretAccessKey
});
AWS.config.credentials = creds;
// AWS.config.region = ""

//======================== routes ==================
require("./app/routes/users")(app);
require("./app/routes/sportcenter")(app)
require("./app/routes/transaction")(app)

var pusherConfig = require('./app/configs/pusher')
app.get("/pusher/auth", (req, res)=>{
    var socketId = req.body.socket_id;
    var channel = req.body.channel_name;
    if (channel.split(pusherConfig.channelPrefix)[1] === req.user._id.toString()){
        var auth = pusher.authenticate(socketId, channel);
        res.formatter.ok(auth);
    }
    else 
        res.formatter.forbidden()
})
//============================error handler=======================
app.use(function (err, req, res, next) {
    console.log(err.message.indexOf("Cast to ObjectId failed"));
    
    if (err.message.indexOf("Cast to ObjectId failed") !== -1) {
        err = {
            statusCode: 500,
            detail: "Resource not exist."
        };
    }



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
