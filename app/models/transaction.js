var mongoose = require('mongoose');
var Schema = mongoose.Schema
var baseUrl = require('../../config/auth').baseUrl
var qrEncoder = require('qrcode')
const errorHandler = require("../helpers/mongoErrorHandler");

var transactionSchema = new Schema({
    host: {
        type: Schema.Types.ObjectId,
        ref: 'host',
        required: true
    },
    center: {
        type: Schema.Types.ObjectId,
        ref: 'SportCenter',
        required: true
    },
    customer: {
        type: Schema.Types.ObjectId,
        ref: 'customer',
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['PAY ONLINE', 'PAY DIRECTLY'],
        required: true
    },
    checkinCode: {
        type: String,
        default: null
    },
    checkoutCode: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['RESOLVED', 'UNRESOLVED'],
        default: 'UNRESOLVED'
    },
    arrivalStatus: {
        type: String,
        enum: ['NOT ARRIVED', 'ARRIVED', 'LEFT'],
        default: 'NOT ARRIVED'
    },
    fee: {
        type: Number
    },
    arrivedAt: {
        type: Date
    },
    leftAt: {
        type: Date
    }
    checkinQRUrl : {
        type : String
    },
    checkoutQRUrl : {
        type : String 
    }
}, {
    timestamps: true,
    versionKey: false
})

transactionSchema.virtual('self_url').get(function () {
    return baseUrl + 'transaction/' + this._id
})

transactionSchema.methods.generateCheckInCode = function (callback) {
    this.checkinCode = this.self_url + '/' + this.createdAt
    qrEncoder.toDataURL(this.checkinCode, (err, url)=>{
        if (err)
            return next(err)
        this.checkinQRUrl = url
        this.save(callback)
    })
}

transactionSchema.methods.checkInAndGenerateCheckoutCode = function (callback) {
    this.arrivedAt = Date.now()
    this.arrivalStatus = 'ARRIVED'
    this.checkoutCode = this.self_url + '/' + this.arrivedAt
    qrEncoder.toDataURL(this.checkoutCode, (err, url)=>{
        if (err)
            return next(err)
        this.checkinCode = null 
        this.checkinQRUrl = null
        this.checkoutQRUrl = url
        this.save(callback)
    })
}

transactionSchema.methods.checkOut = function (callback) {
    this.leftAt = Date.now()
    this.arrivalStatus = 'LEFT'
    this.status = 'RESOLVED'
    this.checkoutCode = null
    this.checkoutQRUrl = null
    this.save(callback)
};

transactionSchema.post('save', errorHandler.handler);
transactionSchema.post('update', errorHandler.handler);
var Transaction = mongoose.model("transaction", transactionSchema);

module.exports = Transaction;
