const passport = require('passport');
const userController = require('../controllers/userController');

module.exports = function (app) {
    app.post("/login", userController.login);

    app.post("/signup", userController.signup);
    app.post("/account/:id/activate",userController.activateAccount);
    app.post("/account/:id/activate/submit",userController.submitActivation);
}
