require('dotenv').config({ path: '.env' });
const express = require("express");
const Request = require("request");
const voucher_codes = require('voucher-code-generator');
const app = express();

app.use(express.json());
app.use(express.urlencoded( {extended: true }));

const RECAPTCHA_SECRET = process.env.SECRET;

app.post("/verify-captcha", async function(req, res) {
    let recaptcha_url = "https://www.google.com/recaptcha/api/siteverify?";
    recaptcha_url += "secret=" + RECAPTCHA_SECRET + "&";
    recaptcha_url += "response=" + req.body["g-recaptcha-response"] + "&";
    // recaptcha_url += "remoteip=" + request.connection.remoteAddress;
    Request(recaptcha_url, function(error, resp, body) {
        body = JSON.parse(body);
        if(body.success !== undefined && !body.success) {
            return res.send({ "message": "Captcha validation failed" });
        }
        res.status(200).json(body);
    });
});

app.get("/",async function (req,res) {
    const {referralCode, email} = req.body;

    data = {
        referer: referralCode,
        code: voucher_codes.generate({
            prefix: `${email.split("@")[0]}-`,
            length: 6
        }),
        email
    }

    res.status(200).json(data);
})

function logErrors (err, req, res, next) {
    console.error(err.stack)
    console.log(err)
}
app.use(logErrors);

app.listen(4000, function() {
    console.log("Listening on port " + 4000 + "...");
});

module.exports = app