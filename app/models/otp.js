const mongoose = require('mongoose');
const moment = require('moment');

const otpConfig = require('../configs/otp');
const errorHandler = require("../helpers/mongoErrorHandler");

const otpSchema = new mongoose.Schema({
    value: {
        type: String,
        required: true
    },
    updatedAt: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

otpSchema.methods.compareOtp = function (value) {
    // return bcrypt.compareSync(value, this.value);
    return this.value === value;
};



otpSchema.methods.expiredOtp = function () {
    var updatedAt = moment(this.updatedAt, otpConfig.timeFormat);
    var now = moment();
    // console.log("expired?");

    return now.diff(updatedAt, 'hours') > otpConfig.maxAage;
};


otpSchema.post('save', errorHandler.handler);
otpSchema.post('update', errorHandler.handler);

const Otp = mongoose.model("otps", otpSchema);

module.exports = Otp;
