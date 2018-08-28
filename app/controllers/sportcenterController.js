var SportCenter = require('../models/sportcenter')
var moment = require('moment')
var Host = require('../models/host')
var Customer = require('../models/customer')
const Center = require("../models/sportcenter");

const multer = require("multer");

const accessControl = require("../controllers/resourceAccessController");

const awsConfig = require("../configs/aws");
const AWS = require("aws-sdk");
const s3 = new AWS.S3();

exports.getAllSportCentersInArea = (req,res,next)=>{
	SportCenter.find({
		status: 'AVAILABLE',
	}, (err, sportCenters) => {
		if (err)
			return next(err)
		var inAreaSportCenters = []
		var radius = req.query.radius ? req.query.radius : 3
		var lat = req.query.lat 
		var lng = req.query.lng
		sportCenters.forEach((sportcenter)=>{
			if (getDistanceByOrdinates(sportcenter.mapLocation.lat, sportcenter.mapLocation.lng, lat, lng) < radius * 0.84)
				inAreaSportCenters.push(sportcenter)
		})
		res.formatter.ok(inAreaSportCenters)

	})
}
exports.getSportCentersInAreaValidedUserRequest = (req,res,next)=>{
	if (req.user.usertype === "customer"){
		SportCenter.find({
			status: 'AVAILABLE'
		}, (err, sportCenters) => {
			if (err)
				return next(err)
			var requestedStart = req.body.start
			var requestedTime = req.body.time 
			if (moment(requestedStart,'YYYY-MM-DDhh:mm:ss').toDate() - Date.now() < 15000){
				var message = "Invalid query date!"
				res.formatter.badRequest({
					message: message
				})
				return
			}
			var query = {
				lat : req.query.lat,
				lng : req.query.lng,
				radius : req.query.radius ? req.query.radius : 3
			}
			var availableSportCenters = getAvailableSportCenters(sportCenters, requestedStart, requestedTime, query)
			res.formatter.ok(availableSportCenters)
		})
	} else {
		var message = "You dont have permission"
		res.formatter.badRequest({
			message: message
		})
	}
}
exports.getSportCenterDetail = (req, res, next) => {
	SportCenter.findOne({
		status: 'AVAILABLE',
		_id: req.params.centerId
	}, (err, sportcenter) => {
		if (err)
			return next(err)
		if (sportcenter) {
			res.formatter.ok(sportcenter)
		} else
			res.formatter.noContent()
	})
}


exports.createSportCenter = (req, res, next) => {
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
function getAvailableSportCenters(sportCenters, requestedStart, requestedTime, query){
	var availableSportCenters = []
	sportCenters.forEach((sportcenter)=>{
		if (getDistanceByOrdinates(sportcenter.mapLocation.lat, sportcenter.mapLocation.lng, query.lat, query.lng) <= query.radius *0.84 ){
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
		}
	})
	return availableSportCenters
}

function getDistanceByOrdinates(lat1, lon1, lat2, lon2) {
    var radlat1 = Math.PI * lat1 / 180
    var radlat2 = Math.PI * lat2 / 180
    var theta = lon1 - lon2
    var radtheta = Math.PI * theta / 180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
        dist = 1;
    }
    dist = Math.acos(dist)
    dist = dist * 180 / Math.PI
    dist = dist * 60 * 1.1515
    return dist * 1.609344
}
