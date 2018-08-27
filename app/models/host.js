const User = require('./users');
const Schema = require('mongoose').Schema;

const Host = User.discriminator("host", new Schema({
    fullname: {
        type: String,
        required: true
    },
    phonenumber: {
        type: String,
        required: true
    }
}))

module.exports = Host;
