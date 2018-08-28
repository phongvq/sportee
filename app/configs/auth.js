const herokuHostUrl = "https://whispering-castle-96662.herokuapp.com";
const localhostUrl = "http://localhost:8042";
// const heroku  = herokuHostUrl;
module.exports = {
    // "facebookAuth": {
    //     "clientID": "1080886742088496",
    //     "clientSecret": "3be414d02f8adcb3a6c22b93304eb22f",
    //     "callbackURL": host + "/oauth/facebook/callback",
    //     "scope": ["email"]
    // },
    // "googleAuth": {
    //     "clientID": "481168917552-7afmn8f6a0tv8mgujjpmo4579otuv0q8.apps.googleusercontent.com",
    //     "clientSecret": "jtsCXQIrYAcgX83-LUjSwPl3",
    //     "callbackURL": host + "/oauth/google/callback",
    //     "scope": ["https://www.googleapis.com/auth/userinfo.email"]
    // },
    "jwt": {
        "secret" : "secretejwtencode"
    },  
    "baseUrl": herokuHostUrl
}
