var SportCenter = require('../models/sportcenter')
var moment = require('moment')
var Host = require('../models/host')
var Customer = require('../models/customer')
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
	if (req.user.usertype === "customer"){
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
	else {
		var message = "You dont have permission"
		res.formatter.badRequest({
			message : message
		})
	}
}
exports.getSportCenterDetail = (req,res,next)=>{
	SportCenter.findOne({
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
	if (req.user.usertype === "host") {
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
            return
        })
    } else {
        err = "You dont have permission";
        res.formatter.forbidden(err);
    }
}

exports.addReservation = (req,res,next)=>{
	SportCenter.findOne({
		_id : req.params.centerId
	}, (err, sportcenter)=>{
		if (err)
			return next(err)
		if (sportcenter){
			var jsDateStartTime = moment(req.body.start,'YYYY-MM-DDhh:mm:ss').toDate()
			var jsDateEndTime = moment(req.body.start,'YYYY-MM-DDhh:mm:ss').add(parseInt(req.body.time),'h').toDate()
			sportcenter.reservations.push({
				startAt : jsDateStartTime,
				endAt : jsDateEndTime
			})
			sportcenter.save((err, updatedSportCenter)=>{
				if (err)
					return next(err)
				res.formatter.ok(updatedSportCenter)
			})
		}
	})
}

function getAvailableSportCenters(sportCenters, requestedStart, requestedTime){
	var availableSportCenters = []
	sportCenters.forEach((sportcenter)=>{
			var reservations = sportcenter.reservations
			var count = 0 
			reservations.forEach(reservation=>{
				var jsDateStartTime = moment(requestedStart,'YYYY-MM-DDhh:mm:ss').toDate()
				var jsDateEndTime = moment(requestedStart,'YYYY-MM-DDhh:mm:ss').add(parseInt(requestedTime), 'h').toDate()
				if ((reservation.startAt - jsDateEndTime > 0)|| (reservation.endAt - jsDateStartTime < 0))
					count++
			})
			if (count == reservations.length)
				availableSportCenters.push(sportcenter)
		})
	return availableSportCenters
}