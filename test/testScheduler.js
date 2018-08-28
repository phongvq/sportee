const moment = require("moment");

const notify = require("../app/services/notif");

const d = new Date();
notify.scheduleTimeExceedWarning("5b8406351d6a974b48884bf2",d);
console.log(Date.now());
// notify.scheduleTimeExceedWarning()
