let nodeMailer = require("nodemailer");
const OSRS = require("osrs-wrapper");
let newLine = "<br>";

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
const FROM_ADDRESS = "'OSRS mailer' <concordiacourseplanner@gmail.com>";
const TIME_OFFSET_HOURS = -4;

// RS-Related
const ITEM_NAME = "Hard Leather";
const SELL_PRICE_HARD_LEATHER = 100;

OSRS.ge.getItems([ITEM_NAME]).then((item) => {
    let price = JSON.parse(item).item.current.price;
    let message = `The current price of ${ITEM_NAME} is ${price}`;
    let subjectHeader = `[OSRS GE] ${ITEM_NAME} Price Update`;

    if (price >= SELL_PRICE_HARD_LEATHER) {
        message += newLine;
        message += `Looks like a good time to sell your ${ITEM_NAME}`;
        subjectHeader += " - TIME TO SELL!";
    }

    nodeMailer.createTransport({
        host: SMTP_HOST,
        port: 465,
        secure: true,
        auth: GMAIL_AUTH_INFO
    }).sendMail({
        from: FROM_ADDRESS,
        to: MAILING_LIST.join(", "),
        subject: subjectHeader,
        html: message,
        date: new Date(new Date().getTime() + 1000 * 60 * 60 * TIME_OFFSET_HOURS)
    }, (err, info) => {
        if (err) {
            return console.log("Error sending message");
        }
        console.log("Message %s sent: %s", info.messageId, info.response);
    });
});
