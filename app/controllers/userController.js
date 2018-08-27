const passport = require("passport");

exports.login = function (req, res, next) {
    passport.authenticate("local-login", (err, user, token) => {
        if (err) return next(err);

        return res.json({
            user: user,
            token: token
        });
    })(req, res, next);
}
