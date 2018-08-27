var SportCenter = require('../models/sportcenter')
var PlayField = require('../models/playfield')
var moment = require('moment')
exports.getAllSportCenters = (req,res,next)=>{
	SportCenter.find({
		status : 'AVAILABLE', 
	}, (err , sportCenters) => {
		if (err)
			return next(err)
		res.formatter.ok(sportCenters)
	})
}
exports.getSportCentersValidedUserRequest = (req,res,next)=>{
	SportCenter.find({
		status : 'AVAILABLE'
	}, (err, sportCenters)=>{
		if (err)
			return next(err)
		var requestedStart = req.body.start
		var requestedTime = req.body.time 
		if (moment(requestedStart).toDate() - Date.now() < 15000){
			var message = "Invalid query date!"
			res.formatter.badRequest({
				message : message
			})
			return
		}
		var availableSportCenters = getAvailableSportCenters(sportCenters, requestedStart, requestedTime)
		res.formatter.ok(availableSportCenters)
	})
}
exports.getSportCenterDetail = (req,res,next)=>{
	SportCenter.find({
		status : 'AVAILABLE',
		_id : req.params.centerId
	}, (err, sportcenter)=>{
		if (err)
			return next(err)
		if (sportcenter){
			res.formatter.ok(sportcenter)
		}
		else 
			res.formatter.noContent()
	})
}


exports.createSportCenter = (req,res,next)=>{
	if (req.user.usertype === "host" && req.user.active === true) {
        var sportcenter = new SportCenter(req.body);
        sportcenter.host = req.user
        sportcenter.reservations = []
        sportcenter.comment = []
        sportcenter.save((err) => {
            if (err) {
                console.log("Failed");
                return next(err);
            }
            res.formatter.created(sportcenter);
        })
    } else {
        err = "You dont have permission";
        res.formatter.forbidden(err);
    }
}

function getAvailableSportCenters(sportCenters, requestedStart, requestedTime){
	var availableSportCenters = []
	sportCenters.forEach((sportcenter)=>{
			var reservations = sportcenter.reservations
			var count = 0 
			reservations.forEach(reservation=>{
				var jsDateStartTime = moment(requestedStart).toDate()
				var jsDateEndTime = moment(requestedStart).add(parseInt(requestedTime), 'h').toDate()
				if ((reservation.startAt - jsDateEndTime > 0)|| (reservation.endAt - jsDateStartTime < 0))
					count++
			})
			if (count == reservations.length)
				availableSportCenters.push(sportcenter)
		})
	return availableSportCenters
}