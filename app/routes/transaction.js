const passport = require('passport');
const transactionController = require('../controllers/transactionController');

module.exports = function (app) {
    app.get('/transaction/all', passport.authenticate("jwt"), transactionController.getAllTransactions)
    app.get('/transaction', passport.authenticate("jwt"), transactionController.getUnresolvedTransactions)
    app.get('/transaction/:transactionId', passport.authenticate("jwt"), transactionController.getTransactionDetail)
    app.post('/transaction',passport.authenticate("jwt"),  transactionController.createTransaction)
    app.post('/transaction/valid-checkin',passport.authenticate("jwt"),  transactionController.validCheckIn)
	app.post('/transaction/valid-checkout',passport.authenticate("jwt"),  transactionController.validCheckOut)
}
