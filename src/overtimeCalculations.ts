import * as fs from "fs";
import * as moment from "moment";
import * as path from "path";
import {ConfigurationManager, ICustomWorkTime} from "./ConfigurationManager";
import {promisify} from "util";
import {pipeline} from "stream";
import {parse} from "csv-parse";

const pipelinePromised = promisify(pipeline);

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

function calculateDailyOvertime(aggregatedData: IAggregatedDurations): IAggregatedDurations {
    const workTime = moment.duration(ConfigurationManager.getInstance().get().dayWorkTime);
    let date;

    for (date in aggregatedData) {
        aggregatedData[date].overtime = aggregatedData[date].duration;

        const customWorkTimeConfig = findCustomWorkTimeForDate(date);

        if (customWorkTimeConfig) {
            if (customWorkTimeConfig.workTimes.hasOwnProperty(aggregatedData[date].dayOfTheWeek)) {
                let specificWorkTime = moment.duration(customWorkTimeConfig.workTimes[aggregatedData[date].dayOfTheWeek]);
                aggregatedData[date].overtime = aggregatedData[date].overtime.subtract(specificWorkTime);
            }
        } else {
            if (["0", "6"].indexOf(aggregatedData[date].dayOfTheWeek) === -1) {
                aggregatedData[date].overtime = aggregatedData[date].overtime.subtract(workTime);
            }
        }
    }

    return aggregatedData;
}

function findCustomWorkTimeForDate(date: string): ICustomWorkTime | undefined {
    if (!ConfigurationManager.getInstance().get().customWorkTimes) {
        return undefined;
    }

    return ConfigurationManager.getInstance().get().customWorkTimes.find((item) => {
        return (item.from && item.from <= date || !item.from) && (!item.to || item.to && item.to >= date);
    });
}

function calculateTotalOvertime(overtimes: IAggregatedDurations): moment.Duration {
    let totalOvertime = moment.duration(0);

    for (let date in overtimes) {
        totalOvertime = totalOvertime.add(overtimes[date].overtime);
    }

    return totalOvertime;
}

export async function getOvertimeForFile(file, verbose) {
    let parser = parse({delimiter: ";"});

    await pipelinePromised(
        fs.createReadStream(file),
        parser
    );

    let data = [];
    for await (const record of parser) {
        data.push(record);
    }

    let transformedData = transformData(data),
        aggregatedData = aggregateDurationsToDays(transformedData),
        overtimes = calculateDailyOvertime(aggregatedData);

    let result = calculateTotalOvertime(overtimes);
    console.log(`# ${file}`);
    if (verbose) {
        console.log(`  Overtime for this file: ${result.as("minutes")}(min), ${result.as("hours")}(h)`);
    }

    return result;
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
