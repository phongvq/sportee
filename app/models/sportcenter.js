const mongoose = require("mongoose")
const Schema = mongoose.Schema
const PlayField = require("./playfield")

var SportCenterSchema = new Schema({
	host : {
		type : Schema.Types.ObjectId,
		required : true,
		ref : 'Host'
	name : {
		type : String,
		required : true
	},
	totalField : {
		type : Number ,
		require : true
	},
	reservations : [{
		startAt : {
			type : Date
		},
		endAt : {
			type : Date
		}
	}],
	literalAddress : {
		type : String,
		required : true
	}, 
	mapLocation : {
		lng : {
			type : String, 
			required : true
		},
		lat : {
			type : String,
			required : true
		}
	},
	status : {
		type : String,
		enum : ['AVAILABLE', 'CLOSED'],
		default : ['AVAILABLE']
	},
	feePerHour : { 
		type : Number,
		required : true
	},
	rate : {
		type : Number,
		min : 0,
		max : 5, 
		default : 2.5
	},
	comments : [
		{
			author : {
				type : Schema.Types.ObjectId,
				ref : 'Customer'
			}
		}
	]
}, {
	timestamp : false,
	versionKey : false
})
const SportCenter = mongoose.model('sportcenter', SportCenterSchema)
module.exports = SportCenter