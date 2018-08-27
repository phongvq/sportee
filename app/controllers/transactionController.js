const SportCenter = require('../models/sportcenter');
var User = require("../models/user")
var Customer = require("../models/customer")
var Host = require("../models/host")

var Transaction = require("../models/transaction")
var accessController = require('./resourceAccessControl')
var qrCodeService = require('../services/qrcodegenerator')
var qrEncoder = require('qrcode')
var pusherConfig = require('../../config/pusher')
var Pusher = require('pusher');

var pusher = new Pusher({
    appId: pusherConfig.appId,
    key: pusherConfig.key,
    secret: pusherConfig.secret,
    cluster: pusherConfig.cluster,
    encrypted: true
})


// For both customer, host, admin
exports.getAllTransactions = (req, res, next) => {
    const usertype = req.user.usertype;
    const query = usertype ? {
        usertype: req.user._id
    } : {};

    Transaction.find(query).populate({
            path: 'center',
            select: 'name literalLocation'
        })
        .populate({
            path: 'customer',
            select: 'fullName phoneNumber'
        })
        .exec((err, transactions) => {
            if (err)
                return next(err)
            res.formatter.ok(transactions)
        });

}

// For both customer, host, admin
exports.getUnresolvedTransactions = (req, res, next) => {
    const usertype = req.user.usertype;
    const query = usertype ? {
        usertype: req.user_id,
        status: "UNRESOLVED"
    } : {
        status: "UNRESOLVED"
    };

    Transaction.find(query).populate({
            path: 'center',
            select: 'name literalLocation'
        })
        .populate({
            path: 'customer',
            select: 'fullName phoneNumber'
        })
        .exec((err, transactions) => {
            if (err)
                return next(err)
            res.formatter.ok(transactions)
        })

}
// For both customer, host, admin
exports.getTransactionDetail = (req, res, next) => {
    Transaction.findOne({
            _id: req.params.transactionId,
        })
        .populate({
            path: 'center',
            select: 'name literalLocation'
        })
        .populate({
            path: 'customer',
            select: 'fullName phoneNumber'
        })
        .exec((err, transaction) => {
            if (err)
                return next(err)
            if (transaction) {
                if (!accessController.hasViewPermissionOnTransactionDetail(req.user, transaction)) {
                    var message = "You dont have permission!"
                    res.formatter.badRequest(message)
                } else {
                    res.formatter.ok(transaction)
                }
            } else
                res.formatter.noContent()
        })
}
// For customer only
exports.createTransaction = (req, res, next) => {
    if (!accessController.hasCreatePermissionOnTransaction(req.user)) {
        var message = "You dont have permission!"
        res.formatter.badRequest(message)
    } else {
        SportCenter.findOne({
            _id: req.body.center
        }, (err, center) => {
            if (!center) {
                var message = "This sport center doesn't exist!"
                res.formatter.badRequest({
                    message: message
                })
                return;
            }
            var transaction = new Transaction(req.body)
            transaction.fee = center.fee
            transaction.host = center.host
            transaction.customer = req.user._id

            transaction.save((err, unsavedTransaction) => {
                if (err)
                    return next(err)
                center.decreaseAvailableSlot(1, (err) => {
                    unsavedTransaction.generateCheckInCode()
                    unsavedTransaction.save((err, savedTransaction) => {
                        qrEncoder.toDataURL(savedTransaction.checkinCode, (err, url) => {
                            if (err)
                                return next(err)
                            var channelName = pusherConfig.channelPrefix + savedTransaction.host.toString()
                            pusher.trigger(channelName, 'customer-request', {
                                customer: {
                                    fullName: req.user.fullName,
                                    phoneNumber: req.user.phoneNumber
                                }
                            })

                            res.formatter.created({
                                transaction: savedTransaction,
                                qrCode: {
                                    url: url
                                }
                            })
                        })
                    })
                })

            })
        })
    }
}
// For customer only
// After host valid the checkin code
// Checkout code is generated and customer can request for the checkout code
exports.requestForCheckinCode = (req, res, next) => {
    Transaction.findOne({
        _id: req.params.transactionId
    }, (err, transaction) => {
        if (err)
            return next(err)
        if (transaction) {
            if (!accessController.hasGetCheckInCodePermissionOnTransaction(req.user, transaction)) {
                var message = "You dont have permission!";
                res.formatter.badRequest({
                    message: message
                })
            } else {
                var checkinCode = transaction.checkinCode
                qrEncoder.toDataURL(checkinCode, (err, url) => {
                    if (err)
                        return next(err)
                    res.formatter.ok({
                        qrCode: {
                            url: url
                        }
                    })
                })
            }
        } else {
            res.formatter.noContent()
        }

    })
}

// For host only 
// Customer arrived and show the QR code
// Then, the host will decode the QR code and send checkIn request to server to valid the decoded
// If valid, the customer may enter the park
exports.validCheckIn = (req, res, next) => {
    Transaction.findOne({
        checkinCode: req.body.decoded,
        status: "UNRESOLVED",
        arrivalStatus: "NOT ARRIVED"
    }, (err, transaction) => {
        if (err)
            return next(err)
        if (transaction) {
            if (!accessController.hasCheckInPermissionOnTransaction(req.user, transaction)) {
                var message = "You dont have permission!"
                res.formatter.badRequest({
                    message: message
                })
            } else {
                transaction.checkInAndGenerateCheckoutCode()
                transaction.save((err, updatedTransaction) => {
                    if (err)
                        return next(err)
                    var channelName = pusherConfig.channelPrefix + updatedTransaction.customer.toString()
                    pusher.trigger(channelName, "checkin-successfully", {
                        message: "You have successfully checked in !",
                    })
                    res.formatter.ok(updatedTransaction)
                })
            }
        } else {
            res.formatter.noContent()
        }
    })
}

// For customer only
// After host valid the checkin code
// Checkout code is generated and customer can request for the checkout code
exports.requestForCheckoutCode = (req, res, next) => {
    Transaction.findOne({
        _id: req.params.transactionId
    }, (err, transaction) => {
        if (err)
            return next(err)
        if (transaction) {
            if (!accessController.hasGetCheckOutCodePermissionOnTransaction(req.user, transaction)) {
                var message = "You dont have permission!"
                res.formatter.badRequest({
                    message: message
                })
            } else {
                var checkoutCode = transaction.checkoutCode
                qrEncoder.toDataURL(checkoutCode, (err, url) => {
                    if (err)
                        return next(err)
                    res.formatter.ok({
                        qrCode: {
                            url: url
                        }
                    })
                })
            }
        } else {
            res.formatter.noContent()
        }

    })
}

// For host only 
// Customer arrived and show the QR code
// Then, the host will decode the QR code and send checkOut request to server to valid the decoded
// If valid, the customer may now leave the park
exports.validCheckOut = (req, res, next) => {
    Transaction.findOne({
            checkoutCode: req.body.decoded,
        })
        .populate({
            path: 'center',
            select: 'name literalLocation availableSlot'
        })
        .exec((err, transaction) => {
            if (err)
                return next(err)
            if (transaction) {
                if (!accessController.hasCheckOutPermissionOnTransaction(req.user, transaction)) {
                    var message = "You dont have permission!"
                    res.formatter.badRequest({
                        message: message
                    })
                } else {
                    transaction.checkOut();
                    transaction.save((err, updatedTransaction) => {
                        if (err)
                            return next(err)
                        updatedTransaction.center.increaseAvailableSlot(1, (err) => {
                            if (err)
                                return next(err)
                            var channelName = pusherConfig.channelPrefix + updatedTransaction.customer.toString()
                            pusher.trigger(channelName, "checkout-successfully", {
                                message: "You have successfully checked out"
                            })
                            res.formatter.ok(updatedTransaction)
                        });
                    });
                }
            } else {
                res.formatter.noContent();
            }
        })
}
