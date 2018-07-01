// libs
const path = require("path");
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const osrs = require("osrs-wrapper");
const csvManager = require("./csvManager");
const emailer = require("./emailer");

// consts
const clientPath = path.join(__dirname, "client");

// main
(() => {
    // serve static files from client/ folder
    app.use(express.static(clientPath));
    app.use(bodyParser.json());

    // allow client to read csv data
    app.get("/api/getCsvData", (req, res) => {
        csvManager.readAllData().catch((err) => {
            res.status(500).send(JSON.stringify(err));
        }).then((dataMap) => {
            return addItemIconUrls(dataMap);
        }).catch((err) => {
            // error adding item icons
            res.status(500).send(JSON.stringify(err));
        }).then((dataMap) => {
            res.send(JSON.stringify(dataMap));
        });
    });

    // allow client to write csv data
    app.post("/api/putCsvData", (req, res) => {
        csvManager.writeAllData(req.body).catch((err) => {
            res.status(500).send(JSON.stringify(err));
        }).then(() => {
            res.send("success");
        });
    });

    // allow client to write csv data
    app.post("/api/sendTestEmail", (req, res) => {
        csvManager.readAllData().catch((err) => {
            res.status(500).send(JSON.stringify(err));
        }).then((dataMap) => {
            return emailer.sendEmails(dataMap.items, [
                {email: req.body.email}
            ]);
        }).catch((err) => {
            res.status(500).send(JSON.stringify(err));
        }).then(() => {
            res.send("success");
        });
    });

    // start server
    app.listen(6969, () => console.log("Server started..."));
})();

let addItemIconUrls = (dataMap) => {
    if(!dataMap.items) {
        return Promise.resolve(dataMap);
    }
    return new Promise((resolve, reject) => {
        osrs.ge.getItems(dataMap.items.map(item=>item.name)).then((responses) => {
            responses.forEach((response, i) => {
                dataMap.items[i].iconUrl = JSON.parse(response).item.icon_large;
            });
            resolve(dataMap);
        }).catch(reject);
    });
};