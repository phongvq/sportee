const mongoose = require("mongoose");



module.exports = function () {
    const dbUrl = "mongodb://master:masterpee123@ds133642.mlab.com:33642/sportee";
    mongoose.connect(dbUrl, {
        useNewUrlParser: true
    }, (err) => {
        if (err) console.log(err);
        else console.log("connected to mlab");
    })
}
