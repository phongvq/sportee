const Pusher = require("pusher");
const pusherConfig = require("../configs/pusher");
var pusher = new Pusher({
    appId: pusherConfig.appId,
    key: pusherConfig.key,
    secret: pusherConfig.secret,
    cluster: pusherConfig.cluster,
    encrypted: true
})

const schedule = require("node-schedule");

exports.scheduleTimeExceedWarning = function (customerId, checkoutTime) {
    const channelName = pusherConfig.channelPrefix + customerId;
    console.log(checkoutTime);
    const startTime = (new Date()).setTime(checkoutTime.getTime() - 15 * 60 * 1000);
    const j = schedule.scheduleJob(customerId.toString(), {
        start: startTime,
        rule: '*/5 * * * *'
    }, function () {
        const now = new Date();
        const exceed = parseInt((now - checkoutTime) / 1000 / 60);
        var message = "";
        if (exceed <= 0)
            message = "Almost time out...";
        else if (exceed === 0)
            message = "Time out... If going on, you have to pay for your exceed time.";
        else
            message = "Warning! Exceed time: " + exceed;

        console.log(message);
        pusher.trigger(channelName, "time-exceed-warn", {
            message: message
        })
    })
}

exports.stopTimeExceedWarning = function (customerId) {
    const channelName = pusherConfig.channelPrefix + customerId;
    schedule.scheduledJobs[channelName].cancel();
}



//TODO: add notif config
