// libs
const fs = require("fs");
const path = require("path");
const parseCsv = require("csv-parse/lib/sync");
const csvStringify = require("csv-stringify");

// consts
const dataPath = path.join(__dirname, "data");

// jesus christ it's jason bourne
let csvRowsToObjectArray = rows => rows.slice(1).map(row=>row.reduce((acc,curr,i)=>Object.assign({[rows[0][i]]:curr},acc),{}));
// and his stunt double
let objectArrayToCsvRows = arr => [Object.keys(arr[0])].concat(arr.map(item=>Object.keys(arr[0]).map(key=>item[key])));

let readFileAndParse = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, fileString) => {
            if(err) {
                reject(err);
            }
            resolve(csvRowsToObjectArray(parseCsv(fileString)));
        });
    });
};

let writeObjectArray = (filePath, objectArray) => {
    return new Promise((resolve, reject) => {
        csvStringify(objectArrayToCsvRows(objectArray), (err, csvString) => {
            if(err) {
                reject(err);
            }
            fs.writeFile(filePath, csvString, (err) => {
                if(err) {
                    reject(err);
                }
                resolve();
            });
        });
    });
};

// read and parse each file
module.exports.readAllData = () => {
    return new Promise((resolve, reject) => {
        fs.readdir(dataPath, (err, files) => {
            if(err) {
                console.log(err);
                reject(err);
            }
            Promise.all(
                files.map(fileName=>readFileAndParse(path.join(dataPath,fileName)))
            ).catch(reject).then((parsedFiles) => {
                resolve(parsedFiles.reduce((acc,parsedFile,i)=>Object.assign({[files[i].slice(0,files[i].indexOf("."))]:parsedFile},acc),{}));
            });
        });
    });
};

// convert each key-value to csv and write to file
module.exports.writeAllData = (data) => {
    return Promise.all(
        Object.keys(data).map(name=>writeObjectArray(path.join(dataPath,`${name}.csv`),data[name]))
    );
};