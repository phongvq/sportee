const passport = require('passport');
const sportcenterController = require('../controllers/sportcenterController');
const accessControl = require("../controllers/resourceAccessController");

module.exports = function (app) {
    app.get('/sportcenter', passport.authenticate("jwt"), sportcenterController.getAllSportCenters);
    app.post('/sportcenter', passport.authenticate("jwt"), sportcenterController.getSportCentersValidedUserRequest);
    app.get('/sportcenter/:centerId', passport.authenticate("jwt"), sportcenterController.getSportCenterDetail);
    app.post('/sportcenter/new', passport.authenticate("jwt"), sportcenterController.createSportCenter);
    app.post('/sportcenter/:centerId', passport.authenticate("jwt"), sportcenterController.addReservation);
    
    app.post("/sportcenter/:centerId/photos/upload",
        passport.authenticate("jwt"),
        sportcenterController.updateDiscriptionPhoto);

    app.get("/sportcenter/:centerId/photos",
        passport.authenticate("jwt"), //all authed user can view park photo
        sportcenterController.getCenterPhotos);
}
