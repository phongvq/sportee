exports.hasViewPermissionOnTransactionDetail = (user, transaction) => {
    return (user.active === true &&
        (user._id.equals(transaction.host) || user._id.equals(transaction.customer) || user.usertype === "admin"))
};
exports.hasCreatePermissionOnTransaction = (user) => {
    return (user.active === true && user.usertype === "customer")
};
exports.hasCheckInPermissionOnTransaction = (user, transaction) => {
    return (user.usertype === "host" && transaction.host.equals(user._id) && transaction.arrivalStatus === "NOT ARRIVED");
};

exports.hasCheckOutPermissionOnTransaction = (user, transaction) => {
    return (user.usertype === "host" && transaction.host.equals(user._id) && transaction.arrivalStatus === "ARRIVED")
};