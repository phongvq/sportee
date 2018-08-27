const mongoose = require('mongoose');

const User = require('../app/models/users');



mongoose.connect("mongodb://master:masterpee123@ds133642.mlab.com:33642/sportee", {
    useNewUrlParser: true
}, (err) => {
    if (err) return console.log(err);
    const newUser = new User({
        email: "duytampa@gmail.com",
        password: "1",
        phoneNumber: "01685179777",
        active: true
    });

    newUser.save((err,user) =>{
        if(err) console.log(err);
        else console.log(user);
    })
});
