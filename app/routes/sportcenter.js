const passport = require('passport');
const sportcenterController = require('../controllers/sportcenterController');

module.exports = function (app) {
    app.get('/sportcenter', passport.authenticate("jwt"), sportcenterController.getAllSportCenters)
    app.post('/sportcenter', passport.authenticate("jwt"), sportcenterController.getSportCentersValidedUserRequest)
    app.get('/sportcenter/:sportcenterId', passport.authenticate("jwt"), sportcenterController.getSportCenterDetail)
    app.post('/sportcenter/new', passport.authenticate("jwt"), sportcenterController.createSportCenter)
    app.post('/sportcenter/:sportcenterId', passport.authenticate("jwt"), sportcenterController.addReservation)

    app.post("/carpark/:centerId/photos/upload",
        passport.authenticate("jwt"),
        accessControl.hasUpdatePermissionOnPark,
        carparkController.updateDiscriptionPhoto);

    app.get("/carpark/:centerId/photos",
        passport.authenticate("jwt"), //all authed user can view park photo
        carparkController.getParkPhotos);

}
