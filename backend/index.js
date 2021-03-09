require('dotenv').config({ path: '.env' });
const express = require("express");
const Request = require("request");

const app = express();

app.use(express.json());
app.use(express.urlencoded( {extended: true }));

const RECAPTCHA_SECRET = process.env.SECRET;

console.log(process.env.SECRET);
app.post("/verify-captcha", function(request, response) {
    let recaptcha_url = "https://www.google.com/recaptcha/api/siteverify?";
    recaptcha_url += "secret=" + RECAPTCHA_SECRET + "&";
    recaptcha_url += "response=" + request.body["g-recaptcha-response"] + "&";
    // recaptcha_url += "remoteip=" + request.connection.remoteAddress;
    Request(recaptcha_url, function(error, resp, body) {
        body = JSON.parse(body);
        if(body.success !== undefined && !body.success) {
            return response.send({ "message": "Captcha validation failed" });
        }
        response.header("Content-Type", "application/json").send(body);
    });
});

app.listen(4000, function() {
    console.log("Listening on port " + 4000 + "...");
});

module.exports = app