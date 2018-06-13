let nodemailer = require("nodemailer");
const osrs = require("osrs-wrapper");

// Email-Related
const SMTP_HOST = "smtp.gmail.com";
const GMAIL_AUTH_INFO = {
    user: "concordiacourseplanner@gmail.com",
    pass: "tranzone"
};
const FROM_ADDRESS = "'Mr. odroid sir' <concordiacourseplanner@gmail.com>";
const MAILING_LIST = [
    "davidhuculak5@gmail.com",
    "petergranitski@gmail.com"
];
const SUBJECT_HEADING = "OSRS GE Price Update";
const TIME_OFFSET_HOURS = -4;

// RS-Related
const ITEM_NAME = "Hard Leather";

osrs.ge.getItems([ITEM_NAME]).then((item) => {
    let price = JSON.parse(item).item.current.price;
    let message = `The current price of ${ITEM_NAME} is ${price}`;
    nodemailer.createTransport({
        host: SMTP_HOST,
        port: 465,
        secure: true, // secure:true for port 465, secure:false for port 587
        auth: GMAIL_AUTH_INFO
    }).sendMail({
        from: FROM_ADDRESS, // sender address
        to: MAILING_LIST.join(", "),
        subject: SUBJECT_HEADING, // Subject line
        html: message, // html body
        date: new Date(new Date().getTime() + 1000 * 60 * 60 * TIME_OFFSET_HOURS)
    }, (err, info) => {
        if (err) {
            return console.log("Error sending message");
        }
        console.log("Message %s sent: %s", info.messageId, info.response);
    });
});