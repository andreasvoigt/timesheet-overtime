import * as fs from "fs";
import * as csvParser from "csv-parse";
import * as moment from "moment";
import * as path from "path";

function transformData(data): Array<any> {
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

interface IAggregatedDurationItem {
    date: string;
    dayOfTheWeek: string;
    duration: moment.Duration;
    overtime?: moment.Duration;
}

interface IAggregatedDurations {
    [date: string]: IAggregatedDurationItem;
}

function aggregateDurationsToDays(data: Array<any>): IAggregatedDurations {
    let aggregateResult: IAggregatedDurations = {};
    
    for (let i = 0; i < data.length; i++) {
        let date: string = data[i].Datum,
            item,
            currentDuration = moment.duration(data[i]["Dauer (rel.)"]);

        if (aggregateResult.hasOwnProperty(date)) {
            item = aggregateResult[date];
            item.duration = currentDuration.add(item.duration);
        } else {
            item = aggregateResult[date] = {
                date: date,
                dayOfTheWeek: moment(date).format("d"),
                duration: currentDuration
            };
        }
    }

    return aggregateResult;
}

const DAY_WORK_TIME = "08:00:00";

function calculateDailyOvertime(aggregatedData: IAggregatedDurations): IAggregatedDurations {
    const workTime = moment.duration(DAY_WORK_TIME);
    let date;

    for (date in aggregatedData) {
        aggregatedData[date].overtime = aggregatedData[date].duration;

        if (["0", "6"].indexOf(aggregatedData[date].dayOfTheWeek) === -1) {
            aggregatedData[date].overtime = aggregatedData[date].overtime.subtract(workTime);
        }
    }

    return aggregatedData;
}

function calculateTotalOvertime(overtimes: IAggregatedDurations): moment.Duration {
    let totalOvertime = moment.duration(0);

    for (let date in overtimes) {
        totalOvertime = totalOvertime.add(overtimes[date].overtime);
    }

    return totalOvertime;
}

export function getOvertimeForFile(file, verbose) {
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
    }).then((result: moment.Duration) => {
        console.log(`# ${file}`);
        if (verbose) {
            console.log(`  Overtime for this file: ${result.as("minutes")}(min), ${result.as("hours")}(h)`);
        }

        return result;
    });
}

export function getOvertimeForDirectory(directory, verbose) {
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
    }).then((files: Array<string>) => {
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
