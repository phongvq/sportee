const mongoose = require('mongoose');

const User = require('../app/models/users');
const Host = require('../app/models/host');


mongoose.connect("mongodb://master:masterpee123@ds133642.mlab.com:33642/sportee", {
    useNewUrlParser: true
}, (err) => {
    if (err) return console.log(err);
    const newUser = new Host({
        email: "duytampa@gmail.com",
        password: "1",
        fullname : "pjpm",
        phonenumber: "01685179777",
        active: true,
        usertype: "host"
    });

    newUser.save((err, user) => {
        if (err) console.log(err);
        else console.log(user);
    })
});
