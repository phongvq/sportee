const passport = require("passport");
const User = require("../models/users");
const Customer = require("../models/customer");
const Host = require("../models/host");


var Otp = require("../models/otp");
var otpConfig = require("../configs/otp");

var otpService = require("../services/otp")
var mailService = require("../services/mail");
const configAuth = require("../configs/auth");

const jwt = require("jsonwebtoken");


exports.login = function (req, res, next) {
    passport.authenticate("local-login", (err, user, token) => {
        if (err) return next(err);

        return res.formatter.ok({
            user: user,
            token: token
        });
    })(req, res, next);
}


exports.signup = function (req, res, next) {
    exports.signup = function (req, res, next) {
        var usertype = req.body.usertype;
        if (
            usertype === "admin" ||
            (usertype !== "customer" && usertype !== "host")
        ) {
            res.formatter.badRequest("Invalid usertype");
            return next();
        }

        if (typeof req.body.password === "undefined") {
            res.formatter.badRequest("Local signup requires password");
            return next();
        }

        var newUser = req.body;
        newUser._id = undefined; // not allow user to define _id and active state
        newUser.active = undefined;
        newUser.createdAt = undefined;
        newUser.updatedAt = undefined;
        User.create(newUser, (err, user) => {
            if (err) {
                return next(err);
                console.log(err);
            } else {
                console.log("Created! ", user);
                var token = jwt.sign(user.toJSON(), configAuth.jwt.secret, {
                    expiresIn: 2592000 //in seconds
                });
                res.formatter.ok({
                    user: user.email,
                    token: token
                });
            }
        });

    };
}

//================================Sign up & activation===================================

exports.signup = function (req, res, next) {
    var usertype = req.body.usertype;
    if (
        usertype === "admin" ||
        (usertype !== "customer" && usertype !== "host")
    ) {
        res.formatter.badRequest("Invalid usertype");
        return next();
    }

    if (typeof req.body.password === "undefined") {
        res.formatter.badRequest("Local signup requires password");
        return next();
    }

    var newUser = req.body;
    newUser._id = undefined; // not allow user to define _id and active state
    newUser.active = undefined;
    newUser.createdAt = undefined;
    newUser.updatedAt = undefined;
    User.create(newUser, (err, user) => {
        if (err) {
            return next(err);
            console.log(err);
        } else {
            console.log("Created! ", user);
            var token = jwt.sign(user.toJSON(), configAuth.jwt.secret, {
                expiresIn: 2592000 //in seconds
            });
            res.formatter.ok({
                user: user.email,
                token: token
            });
        }
    });

};

exports.activateAccount = function (req, res, next) {
    var userId = req.params.id;
    // console.log(user);

    User.findById(userId, (err, user) => {
        if (err) {
            return next(err);
        }

        if (!user) return res.formatter.forbidden("You need an account to perform this action");
        else if (user.active === true) {
            return res.formatter.forbidden("This account has already activated");

        } else {
            otpService.getValidOtp(userId, (err, otpValue) => {
                if (err) return next(err);
                else {
                    mailService.sendOtp(user.email, otpValue, (err) => {
                        // console.log("callback");
                        console.log("Otp sent: " + otpValue);
                        if (err) return next(err);
                        else {
                            res.formatter.ok("Otp has been sent to your email");
                            return next();
                        }
                    });
                }
            });
        }
    })
};


exports.submitActivation = function (req, res, next) {
    const submitOtp = req.body.otp;
    const userId = req.params.id;


    if (!submitOtp) {
        return res.formatter.badRequest("Otp required");
    }

    User.findById(userId, (err, user) => {
        if (err) return next(err);
        if (!user) return res.formatter.forbidden("");

        else if (user.active === true) {
            return res.formatter.forbidden("This account has already activated");

        } else {
            Otp.findOne({
                    userId: user._id
                },
                (err, otp) => {
                    if (err) return next(err);
                    if (otp.compareOtp(submitOtp) && !otp.expiredOtp()) {
                        User.update({
                                _id: user._id
                            }, {
                                $set: {
                                    active: true
                                }
                            },
                            (err, raw) => {
                                if (err) return next(err);
                                else {
                                    res.formatter.ok("Account activated");
                                    return next();
                                }
                            }
                        );
                    } else {
                        if (otp.expiredOtp()) {
                            res.formatter.ok("OTP expired");
                            return next();
                        }
                        if (!otp.compareOtp()) {
                            res.formatter.ok("OTP does not match");
                            return next();
                        }
                    }
                }
            );
        }
    })


};
