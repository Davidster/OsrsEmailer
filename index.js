let nodemailer = require("nodemailer");
const osrs = require("osrs-wrapper");

// Email-Related
const SMTP_HOST = "smtp.gmail.com";
const GMAIL_AUTH_INFO = {
    user: "concordiacourseplanner@gmail.com",
    pass: "tranzone"
};
const MAILING_LIST = [
    "davidhuculak5@gmail.com",
    "petergranitski@gmail.com"
];
const FROM_ADDRESS = "'Mr. odroid sir' <concordiacourseplanner@gmail.com>";
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
        secure: true,
        auth: GMAIL_AUTH_INFO
    }).sendMail({
        from: FROM_ADDRESS,
        to: MAILING_LIST.join(", "),
        subject: SUBJECT_HEADING,
        html: message,
        date: new Date(new Date().getTime() + 1000 * 60 * 60 * TIME_OFFSET_HOURS)
    }, (err, info) => {
        if (err) {
            return console.log("Error sending message");
        }
        console.log("Message %s sent: %s", info.messageId, info.response);
    });
});