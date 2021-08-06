import * as calculations from "./overtimeCalculations";
import {ConfigurationManager} from "./ConfigurationManager";
import {Command} from "commander";
import * as moment from "moment";

enum Commands {
    readDirectory,
    readFile
}

async function main(path, command: Commands) {
    const file = path;

    const options = program.opts();
    const verbose = options.verbose || false;

    const config = options.config || undefined;

    if (config) {
        ConfigurationManager.getInstance().init(config);
    }

    let result: moment.Duration;
    if (command === Commands.readDirectory) {
        result = await calculations.getOvertimeForDirectory(file, verbose);
    } else if (command === Commands.readFile) {
        result = await calculations.getOvertimeForFile(file, verbose);
    } else {
        throw new Error("unknown command (use '-h' for more information)");
    }

    console.log("Total Overtime: ", result.as("minutes"), "(min)");
    console.log("Total Overtime: ", result.as("hours"), "(h)");
    console.log("==== programm finished ====");
}

const program = new Command();

program
    .version("0.4.0")
    .option("--config <config>", "use custom config instead to overwrite default values")
    .option("--verbose", "print detailed information for each file");

program
    .command("readDirectory <path>")
    .action(async (path) => {
        return await main(path, Commands.readDirectory);
    });

program
    .command("readFile <path>")
    .action(async (path) => {
        return await main(path, Commands.readFile);
    });

program
    .parseAsync(process.argv)
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
