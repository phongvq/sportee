const randomstring = require('randomstring');
const moment = require('moment');

const otpConfig = require('../../config/otp');
const Otp = require("../models/otp");
const moment = require("moment");


function genOtp() {
    return randomstring.generate({
        length: otpConfig.length,
        charset: otpConfig.charset
    });
}

exports.getValidOtp = function (userId, done) {
    Otp.findOne({
            userId: userId
        },
        (err, otp) => {
            if (err) return done(err);

            var otpValue = genOtp();
            if (!otp) {
                var newOtp = new Otp();
                newOtp.userId = userId;
                newOtp.value = otpValue;
                newOtp.updatedAt = moment().format(otpConfig.timeFormat);

                Otp.create(newOtp, (err, otp) => {
                    if (err) {
                        return done(err);
                    } else {
                        console.log("saved new otp");
                        return done(null, otpValue);
                    }
                })

            } else {
                if (otp.expiredOtp()) {
                    console.log("Expired");
                    Otp.update({
                            _id: otp._id
                        }, {
                            $set: {
                                value: otpValue,
                                updatedAt: moment().format(otpConfig.timeFormat)
                            }
                        },
                        (err, otp) => {
                            if (err) return done(err);
                            else return done(null, otpValue);
                            // else
                            // 	console.log(otp);
                        }
                    );
                } else {
                    return done(null, otp.value);
                }
            }

            // console.log("prepare sending mail");
        }
    )
}
