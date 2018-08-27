var mailConfig = require("../configs/mailgun");
var mailgun = require('mailgun-js')({
    apiKey: mailConfig.api_key,
    domain: mailConfig.domain
});

exports.sendOtp = function (userEmail, otp, done) {
    var data = {
        from: 'Smart Parking <postmaster@sandbox149ed5703e7c460481738ca7b543c23b.mailgun.org>',
        to: userEmail,
        subject: 'Validation code',
        text: 'Your validation code is: ' + otp
    };
    console.log("run");
    process.nextTick(function () {
        mailgun.messages().send(data, function (error, body) {
            if (error) {
                // console.log(error);
                return done(error);
            } else {
                return done(null);
            }
        });
    });
}
