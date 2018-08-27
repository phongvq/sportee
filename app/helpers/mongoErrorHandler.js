exports.handler = function (err, doc, next) {
    // console.log(err.message);
    console.log(err.message);

    if (err.code) {
        switch (err.code) {
            case 11000:
                var duplicateField = err.message.split(".$")[1]
                    .split(" dup key")[0];
                duplicateField = duplicateField.substring(0, duplicateField.lastIndexOf("_"));
                return next(new Error(duplicateField + " duplicated"));
                break;

            default:
                return next(err);
                break;
        }
    } else {
        return;







        next(err);
    }
}
