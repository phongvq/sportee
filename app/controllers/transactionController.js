const SportCenter = require('../models/sportcenter');
var User = require("../models/users")
var Customer = require("../models/customer")
var Host = require("../models/host")
var Transaction = require("../models/transaction")
var accessController = require('./resourceAccessController')
var pusherConfig = require('../configs/pusher')
var Pusher = require('pusher');
var moment = require('moment')
var pusher = new Pusher({
    appId: pusherConfig.appId,
    key: pusherConfig.key,
    secret: pusherConfig.secret,
    cluster: pusherConfig.cluster,
    encrypted: true
})

const notifService = require("../services/notif");

// For both customer, host, admin
exports.getAllTransactions = (req, res, next) => {
    console.log(req.user.usertype)
    const usertype = req.user.usertype;

    const query = usertype ? {
        usertype: req.user._id
    } : {};
    Transaction.find(query).populate({
            path: 'center',
            select: 'name literalLocation'
        })
        .populate({
            path: "customer",
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
            var transaction = new Transaction()
            transaction.center = req.body.center
            transaction.paymentMethod = req.body.paymentMethod
            transaction.fee = center.feePerHour
            transaction.host = center.host
            transaction.customer = req.user._id
            transaction.start = moment(req.body.start, 'YYYY-MM-DDhh:mm:ss').toDate()
            transaction.end = moment(req.body.start, 'YYYY-MM-DDhh:mm:ss').add(parseInt(req.body.time), 'h').toDate()


            transaction.generateCheckInCode((err, updatedTransaction) => {
                center.reservations.push({
                    startAt: updatedTransaction.start,
                    endAt: updatedTransaction.end,
                    transaction: updatedTransaction
                })
                center.save((err) => {
                    if (err)
                        return next()
                    res.formatter.created({
                        transaction: updatedTransaction,
                        sportcenter: {
                            name: center.name,
                            literalAddress: center.literalAddress
                        }
                    })
                    var channelName = pusherConfig.channelPrefix + updatedTransaction.host.toString()
                    pusher.trigger(channelName, "slot-request-event", {
                        customer: req.user,
                        transaction: updatedTransaction
                    })
                })
            })

        })
    }
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
                transaction.checkInAndGenerateCheckoutCode((err, updatedTransaction) => {
                    if (err)
                        return next(err)
                    const channelName = pusherConfig.channelPrefix + updatedTransaction.customer.toString();

                    notifService.scheduleTimeExceedWarning(updatedTransaction.customer.toString(), updatedTransaction.customer.end);

                    pusher.trigger(channelName, "checkin-successfully", {
                        message: "You have successfully checked in!",
                        transaction: updatedTransaction,
                    })
                    res.formatter.ok(updatedTransaction)
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
        status: "UNRESOLVED",
        arrivalStatus: "ARRIVED"
    }).populate({
        path: 'center',
        select: 'name literalLocation reservations'
    }).exec((err, transaction) => {
        if (err)
            return next(err)
        if (transaction) {
            if (!accessController.hasCheckOutPermissionOnTransaction(req.user, transaction)) {
                var message = "You dont have permission!"
                res.formatter.badRequest({
                    message: message
                })
            } else {
                transaction.checkOut((err, updatedTransaction) => {
                    if (err)
                        return next(err)
                    var index = null
                    var reservations = updatedTransaction.center.reservations
                    console.log(reservations)
                    for (var i = 0; i < reservations.length; i++)
                        if (reservations[i].transaction != undefined)
                            if (reservations[i].transaction.equals(updatedTransaction._id)) {
                                index = i;
                                break
                            }
                    if (index != null)
                        updatedTransaction.center.reservations.splice(index, 1)
                    updatedTransaction.center.save((err) => {
                        if (err)
                            return next(err)
                        const channelName = pusherConfig.channelPrefix + updatedTransaction.customer.toString();


                        //start 'cron' timeout warning
                        notifService.stopTimeExceedWarning(updatedTransaction.customer.toString());
                        pusher.trigger(channelName, "checkout-successfully", {
                            message: "You have successfully checked out"
                        })
                        res.formatter.ok(updatedTransaction)
                    })
                })
            }
        } else {
            res.formatter.noContent();
        }
    })
}
