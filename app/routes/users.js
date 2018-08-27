const passport = require('passport');
const userController = require('../controllers/userController');

module.exports = function (app) {
    app.post("/login", userController.login);
    app.post("/signup", userController.signup);
}
