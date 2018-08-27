exports.handler = function (err, doc, next) {
    // console.log(err.message);
    if (err.name === "MongoError") {
        switch (err.code) {
            case 11000:
                var duplicateField = err.message.split(".$")[1]
                    .split(" dup key")[0];
                duplicateField = duplicateField.substring(0, duplicateField.lastIndexOf("_"));
                next(new Error(duplicateField + " duplicated"));
                break;

            default:
                next(err);
                break;
        }
    } else {
        next(err);
    }
}
