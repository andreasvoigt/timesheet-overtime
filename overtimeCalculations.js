"use strict";

const fs = require("fs");
const csvParser = require("csv-parse");
const moment = require("moment");
const path = require("path");

function transformData(data) {
    let transformed = [],
        head = data.shift();

    for (let i = 0; i < data.length; i++) {
        let item = {};
        for (let j = 0; j < head.length; j++) {
            item[head[j]] = data[i][j];
        }
        transformed.push(item);
    }

    return transformed;
}

function aggregateDurationsToDays(data) {
    let aggregateResult = {};
    
    for (let i = 0; i < data.length; i++) {
        let date = data[i].Datum,
            item;

        if (aggregateResult.hasOwnProperty(date)) {
            item = aggregateResult[date];
        } else {
            item = aggregateResult[date] = {
                date: date,
                dayOfTheWeek: moment(date).format("d")
            };
        }

        let currentDuration = moment.duration(data[i]["Dauer (rel.)"]);

        if (item.duration) {
            item.duration = currentDuration.add(item.duration);
        } else {
            item.duration = currentDuration;
        }
    }

    return aggregateResult;
}

const DAY_WORK_TIME = "08:00:00";

function calculateDailyOvertime(aggregatedData) {
    let workTime = moment.duration(DAY_WORK_TIME),
        date;

    for (date in aggregatedData) {
        aggregatedData[date].overtime = aggregatedData[date].duration;

        if (["0", "6"].indexOf(aggregatedData[date].dayOfTheWeek) === -1) {
            aggregatedData[date].overtime = aggregatedData[date].overtime.subtract(workTime);
        }
    }

    return aggregatedData;
}

function calculateTotalOvertime(overtimes) {
    let totalOvertime = moment.duration(0);

    for (let date in overtimes) {
        totalOvertime = totalOvertime.add(overtimes[date].overtime);
    }

    return totalOvertime;
}

function getOvertimeForFile(file, verbose) {
    return new Promise((resolve, reject) => {
        let parser = csvParser({delimiter: ";"}, (err, data) => {
            if (err) {
                return reject(err);
            }
        
            let transformedData = transformData(data),
                aggregatedData = aggregateDurationsToDays(transformedData),
                overtimes = calculateDailyOvertime(aggregatedData);
        
            //console.log(transformedData);
            //console.log(aggregatedData);
            //console.log(overtimes);
        
            //console.log(calculateTotalOvertime(overtimes));

            resolve(calculateTotalOvertime(overtimes));
        });
        
        fs.createReadStream(file).pipe(parser);
    }).then((result) => {
        console.log(`# ${file}`);
        if (verbose) {
            console.log(`  Overtime for this file: ${result.as("minutes")}(min), ${result.as("hours")}(h)`);
        }

        return result;
    });
}

function getOvertimeForDirectory(directory, verbose) {
    return new Promise((resolve, reject) => {
        let filter = /\.csv$/,
            dir = path.normalize(directory);

        fs.readdir(dir, (err, files) => {
            if (err) {
                return reject(err);
            }

            let filteredFiles = [];

            for (let i = 0; i < files.length; i++) {
                if (filter.test(files[i])) {
                    filteredFiles.push(path.resolve(dir, files[i]));
                }
            }

            resolve(filteredFiles);
        });
    }).then((files) => {
        return files.reduce((promise, item) => {
            return promise.then((totalDuration) => {
                return getOvertimeForFile(item, verbose)
                    .then((duration) => {
                        return totalDuration.add(duration);
                    });
            });
        }, Promise.resolve(moment.duration(0)));
    });
}

module.exports.getOvertimeForDirectory = getOvertimeForDirectory;
module.exports.getOvertimeForFile = getOvertimeForFile;