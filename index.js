"use strict";

let program = require("commander");

const calculations = require("./overtimeCalculations");

let file;

program
    .version("0.1.0")
    .usage("[options] <file>")
    .option("-d, --directory", "select directory")
    .option("-f, --file", "select file")
    .action((selectedFile) => {
        file = selectedFile;
    })
    .parse(process.argv);

Promise.resolve()
    .then(() => {
        if (program.directory) {
            return calculations.getOvertimeForDirectory(file);
        } else if (program.file) {
            return calculations.getOvertimeForFile(file);
        } else {
            return Promise.reject("no parameters given (use '-h' for more information)");
        }
    })
    .then((result) => {
        //console.log(result);
        console.log("Total Overtime: ", result.as("minutes"), "(min)");
        console.log("Total Overtime: ", result.as("hours"), "(h)");
        console.log("==== programm finished ====");
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });