// const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');

const configAuth = require("./auth");
const User = require('../models/users');
module.exports = function (passport) {

    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });
    passport.use("local-login", new LocalStrategy({
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true
    }, function (req, email, password, done) {
        //TODO: user query, callback 
        console.log("run");
        User.findOne({
            'email': email
        }).select('+password').exec(function (err, user) {
            // if there are any errors, return the error before anything else
            // user = users[0];
            let error = {};
            error.statusCode = 500;
            if (err) {
                error.detail = err;
                return done(error, false);
            }
            // if no user is found, return the message
            console.log(user);
            if (!(user && user.comparePassword(password))) {
                error.statusCode = 401;
                error.detail = "Invalid email or passsword";
                return done(error, false);
            }

            let token = jwt.sign(user.toJSON(), configAuth.jwt.secret, {
                expiresIn: 2592000 //in seconds
            });

            user['password'] = undefined;
            //TODO: token
            return done(null, user, token);
        })
    }))
    passport.use('jwt', new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromHeader('authorization'),
        secretOrKey: configAuth.jwt.secret
    }, function (jwt_payload, done) {
        User.findOne({
            _id: jwt_payload._id
        }, function (err, user) {
            var error = {};
            error.statusCode = 500;

            if (err) {
                error.detail = err;
                return done(error);
            }

            if (!user)
                return done(null, false);

            return done(null, user);
        });
    }));
}
