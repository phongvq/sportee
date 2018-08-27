const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bcrypt = require('bcrypt-nodejs');

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        select: true,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        required: true
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

const User = mongoose.model('users', userSchema);

module.exports = User;
