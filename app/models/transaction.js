var mongoose = require('mongoose');
var Schema = mongoose.Schema
var baseUrl = require('../../config/auth').baseUrl

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

    payingMethod: {
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
}, {
    timestamps: true,
    versionKey: false
})

transactionSchema.virtual('self_url').get(function () {
    return baseUrl + 'transaction/' + this._id
})



//TODO: select -id,_v



transactionSchema.methods.generateCheckInCode = function () {
    this.checkinCode = this.self_url + '/' + this.createdAt
}
transactionSchema.methods.checkInAndGenerateCheckoutCode = function () {
    this.arrivedAt = Date.now()
    this.arrivalStatus = 'ARRIVED'
    this.checkoutCode = this.self_url + '/' + this.arrivedAt

}

transactionSchema.methods.checkOut = function () {
    this.leftAt = Date.now()
    this.arrivalStatus = 'LEFT'
    this.status = 'RESOLVED'
};

transactionSchema.post('save', errorHandler.handler);
transactionSchema.post('update', errorHandler.handler);
var Transaction = mongoose.model("transaction", transactionSchema);

module.exports = Transaction;
