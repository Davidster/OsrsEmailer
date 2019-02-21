const csvManager = require("./csvManager");
const emailer = require("./emailer");

csvManager.readAllData().then((dataMap) => {
    emailer.sendEmails(dataMap.items, dataMap.subscribers);
});