const Customer = require('./users');
const Schema = require('mongoose').Schema;

const Customer = User.discriminator("customer", new Schema({
    fullname: {
        type: String,
        required: true
    },
    phonenumber: {
        type: String,
        required: true
    }
}))

module.exports = Customer;
