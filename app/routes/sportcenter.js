const passport = require('passport');
const sportcenterController = require('../controllers/sportcenterController');

module.exports = function (app) {
    app.get('/sportcenter', passport.authenticate("jwt"), sportcenterController.getAllSportCentersInArea)
    app.post('/sportcenter', passport.authenticate("jwt"), sportcenterController.getSportCentersInAreaValidedUserRequest)
    app.get('/sportcenter/:centerId', passport.authenticate("jwt"), sportcenterController.getSportCenterDetail)
    app.post('/sportcenter/new',passport.authenticate("jwt"),  sportcenterController.createSportCenter)
}
