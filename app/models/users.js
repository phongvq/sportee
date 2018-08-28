const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const errorHandler = require("../helpers/mongoErrorHandler");

const bcrypt = require('bcrypt-nodejs');

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        select: true,
        required: true
    },
    active: {
        type: Boolean,
        required: true,
        default: true
    }
}, {discriminatorKey: "usertype"});

userSchema.pre("save", function (next) {
    console.log(this.password);
    this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(8))

    next();
})

userSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
}

userSchema.post('save', errorHandler.handler);
userSchema.post('update', errorHandler.handler);

const User = mongoose.model('users', userSchema);

module.exports = User;


//TODO: email, phone validation
