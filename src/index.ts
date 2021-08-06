import * as program from "commander";

import * as calculations from "./overtimeCalculations";
import {ConfigurationManager} from "./ConfigurationManager";

let file;

program
    .version("0.4.0")
    .usage("[options] <file>")
    .option("-d, --directory", "select directory")
    .option("-f, --file", "select file")
    .option("--verbose", "print detailed information for each file")
    .option("--config <config>", "use custom config instead to overwrite default values")
    .action((selectedFile) => {
        file = selectedFile;
    })
    .parse(process.argv);

Promise.resolve()
    .then(() => {
        const verbose = program.verbose || false;

        const config = program.config || undefined;

        if (config) {
            ConfigurationManager.getInstance().init(config);
        }

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