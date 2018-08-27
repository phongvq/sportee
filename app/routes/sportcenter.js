const passport = require('passport');
const sportcenterController = require('../controllers/sportcenterController');

module.exports = function (app) {
    app.get('/sportcenter', passport.authenticate("jwt"), sportcenterController.getAllSportCenters)
    app.post('/sportcenter', passport.authenticate("jwt"), sportcenterController.getSportCentersValidedUserRequest)
    app.get('/sportcenter/:centerId', passport.authenticate("jwt"), sportcenterController.getSportCenterDetail)
    app.post('/sportcenter/new',passport.authenticate("jwt"),  sportcenterController.createSportCenter)
    app.post('/sportcenter/:centerId',passport.authenticate("jwt"),  sportcenterController.addReservation)
}
