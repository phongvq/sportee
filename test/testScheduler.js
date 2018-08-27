const schedule = require('node-schedule');

const startTime = new Date(Date.now());
const endTime = new Date(startTime.getTime() + 100000);

function startJob(name) {
    var j = schedule.scheduleJob(name, {
        start: startTime,
        end: endTime,
        rule: '*/1 * * * * *'
    }, function () {
        console.log("job");
    });
    console.log(schedule.scheduledJobs);
}
// j.name = "checkout job";


startJob(Date.now().toString());
startJob(Date.now().toString());
