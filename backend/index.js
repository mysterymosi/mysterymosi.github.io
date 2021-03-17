require('dotenv').config({ path: '.env' });
const express = require("express");
const Request = require("request");
const voucher_codes = require('voucher-code-generator');
var cors = require('cors')
const db = require('./models');
const app = express();

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const RECAPTCHA_SECRET = process.env.SECRET;
db.sequelize.sync()

function catchErrors(fn) {
    return function (req, res, next) {
        return fn(req, res, next).catch(next);
    };
}

async function recaptcha(req, res) {
    let recaptcha_url = "https://www.google.com/recaptcha/api/siteverify?";
    recaptcha_url += "secret=" + RECAPTCHA_SECRET + "&";
    recaptcha_url += "response=" + req.body["g-recaptcha-response"] + "&";
    // recaptcha_url += "remoteip=" + request.connection.remoteAddress;
    Request(recaptcha_url, function (error, resp, body) {
        body = JSON.parse(body);
        if (body.success !== undefined && !body.success) {
            return res.send({ "message": "Captcha validation failed" });
        }
        res.status(200).json(body);
    });
}


async function generateRefCode(req, res) {
    let { referrer, email } = req.body;

    if (referrer != "" && referrer != 'undefined' && referrer != null) {
        ref = await db.User.findOne({
            where: {
                refcode: referrer
            }
        })

        if(!ref){
            res.status(400).json({message: "no user exists with this code"})
        }
        let point = ref.dataValues.points + 1
        ref.update({
            points: point
        }, {
            where: {
                refcode:referrer
            }
        });
    }
    if(referrer == ""){
        referrer = null;
    }
    const user = await db.User.create({
        referrer,
        email,
        refcode: email.split("@")[0]
    })
    data = {
        refcode: user.dataValues.refcode,
        email: user.dataValues.email
    }

    res.status(200).json(data);
}

async function getReferrer(req,res){
    const {email} = req.body;
    console.log(email,req.body.email)
    if(email == ""){
        data = {
            message:"no email"
        }
        res.status(400).json(data)
    }

    const user = await db.User.findOne({
        where: {
            email
        },
        attributes:[
            'uid','email','referrer','refcode','points',[db.Sequelize.literal('(RANK() OVER (ORDER BY points DESC))')]
        ],
        include: [
            {
                model: db.User,
                as: 'referrals',
                attributes: ['email']
                
        }
    ]
    })
    res.status(200).json(user);
}

async function getWaitingList(req,res){
    const user = await db.User.findAll({
        order: [
            ['points', 'DESC']
        ]
    })
    res.status(200).json(user);
}

app.post("/verify-captcha", catchErrors(recaptcha));

app.post("/", catchErrors(generateRefCode))
app.get("/", catchErrors(getReferrer))
app.get("/waiting-list", catchErrors(getWaitingList))

function logErrors(err, req, res, next) {
    console.error(err.stack)
    console.log(err)
}
app.use(logErrors);

app.listen(4000, function () {
    console.log("Listening on port " + 4000 + "...");
});

module.exports = app