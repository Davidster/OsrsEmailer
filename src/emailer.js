// libs
const nodeMailer = require("nodemailer");
const osrs = require("osrs-wrapper");

//consts
const SMTP_HOST = "smtp.gmail.com";
const GMAIL_AUTH_INFO = {
    user: "concordiacourseplanner@gmail.com",
    pass: "tranzone"
};
const FROM_ADDRESS = "'OSRS mailer' <concordiacourseplanner@gmail.com>";
const TIME_OFFSET_HOURS = -4;
const NEW_LINE = "<br>";

module.exports.sendEmails = (items, subscribers) => {
    return new Promise((resolve, reject) => {
        osrs.ge.getItems(items.map(item=>item.name)).then((responseStrings) => {
            let timeToSell = false;
            let message = "";

            responseStrings.forEach((responseString, i) => {
                let itemInfo = JSON.parse(responseString).item;
                let itemName = itemInfo.name;
                let itemPrice = parsePrice(itemInfo.current.price);
                let sellPrice = parsePrice(items[i].sellPrice);

                message += `The current price of ${itemName} is ${itemPrice}`;
                if (itemPrice >= sellPrice) {
                    message += NEW_LINE;
                    message += `<strong>Looks like a good time to sell your ${itemName}</strong>`;
                    timeToSell = true;
                }
                message += NEW_LINE + NEW_LINE;
            });

            let subjectHeader = "[OSRS GE] Price Update";
            if(timeToSell) {
                subjectHeader += " - TIME TO SELL!";
            }

            nodeMailer.createTransport({
                host: SMTP_HOST,
                port: 465,
                secure: true,
                auth: GMAIL_AUTH_INFO
            }).sendMail({
                from: FROM_ADDRESS,
                to: subscribers.map(subscriber=>subscriber.email).join(", "),
                subject: subjectHeader,
                html: message,
                date: new Date(new Date().getTime() + 1000 * 60 * 60 * TIME_OFFSET_HOURS)
            }, (err, info) => {
                if (err) {
                    console.log("Error sending message");
                    return reject(err);
                }
                console.log("Message %s sent: %s", info.messageId, info.response);
                resolve();
            });
        });
    });
};

/*
* sometimes the price is a plain int (e.g. 24),
* sometimes it's a string with comma style (e.g. '2,900'),
* sometimes it's a string with a 'k' (e.g. '36.4k'),
* sometimes it's a string with a 'm' (e.g. '1.1m')
*
* */
// sometimes the price is a plain int, sometimes its a a string with comma style
let parsePrice = (price) => {
    price = price.toString();
    if(price.indexOf(",") >= 0) {
        price = replaceAll(price, ",", "");
    } else if(price.indexOf("k") >= 0) {
        price = parseFloat(price) * 1000;
    } else if(price.indexOf("m") >= 0) {
        price = parseFloat(price) * 1000000;
    }
    return parseInt(price);
};

let replaceAll = (str, find, replace) => {
    return str.replace(new RegExp(find, 'g'), replace);
};