import * as program from "commander";

import * as calculations from "./overtimeCalculations";

let file;

program
    .version("0.3.0")
    .usage("[options] <file>")
    .option("-d, --directory", "select directory")
    .option("-f, --file", "select file")
    .option("--verbose", "print detailed information for each file")
    .action((selectedFile) => {
        file = selectedFile;
    })
    .parse(process.argv);

Promise.resolve()
    .then(() => {
        const verbose = program.verbose || false;
        if (program.directory) {
            return calculations.getOvertimeForDirectory(file, verbose);
        } else if (program.file) {
            return calculations.getOvertimeForFile(file, verbose);
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