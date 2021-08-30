import {getOvertimeForDirectory, getOvertimeForFile} from "../src/overtimeCalculations";
import * as moment from "moment";
import {ConfigurationManager} from "../src/ConfigurationManager";

require("jasmine-expect");

describe("getOvertimeForFile", () => {

    beforeEach(() => {
        spyOn(console, "log");
    });

    it('should be defined', function () {
        expect(getOvertimeForFile).toBeDefined();
        // expect(getOvertimeForFile).toBeFunction(); // the matcher does not work on async functions
    });

    it('should return a promise', function () {
        let promise = getOvertimeForFile("spec/support/timesheet_1.csv", false);
        expect(promise).toBeInstanceOf(Promise);
        return promise;
    });

    it('should return a result with correctly calculated overtime value', async function () {
        let result = await getOvertimeForFile("spec/support/timesheet_1.csv", false);
        expect(moment.isDuration(result)).toBeTrue();
        expect(result.as("minutes")).toEqual(-73);
        expect(result.as("hours")).toEqual(-73/60);
    });

    it('should log out detailed information if verbose mode is active', async function () {
        await getOvertimeForFile("spec/support/timesheet_1.csv", true);
        expect(console.log).toHaveBeenCalledTimes(2);
        expect(console.log).toHaveBeenCalledWith("# spec/support/timesheet_1.csv");
        expect(console.log).toHaveBeenCalledWith("  Overtime for this file: -73(min), -1.2166666666666666(h)");
    });

    it('should return a correct result regarding custom specific work time configuration', async function () {
        ConfigurationManager.getInstance().init("spec/support/test_config1.json5");
        let result = await getOvertimeForFile("spec/support/timesheet_1.csv", false);
        expect(moment.isDuration(result)).toBeTrue();
        expect(result.as("minutes")).toEqual(1967);
        expect(result.as("hours")).toEqual(1967/60);
        ConfigurationManager.getInstance().reset();
    });

    it('should return a correct result regarding custom simple work time configuration', async function () {
        ConfigurationManager.getInstance().init("spec/support/test_config2.json5");
        let result = await getOvertimeForFile("spec/support/timesheet_1.csv", false);
        expect(moment.isDuration(result)).toBeTrue();
        expect(result.as("minutes")).toEqual(1127);
        expect(result.as("hours")).toEqual(1127/60);
        ConfigurationManager.getInstance().reset();
    });

    it('should return an error if file does not exist', async function () {
        let error: Error;
        try {
            await getOvertimeForFile("spec/support/timesheet_8.csv", false);
        } catch (e) {
            error = e;
        }

        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toEqual("ENOENT: no such file or directory, open 'spec/support/timesheet_8.csv'")
    });
});

describe("getOvertimeForDirectory", () => {
    beforeEach(() => {
        spyOn(console, "log");
    });

    it('should be defined', function () {
        expect(getOvertimeForDirectory).toBeDefined();
        expect(getOvertimeForDirectory).toBeFunction();
    });

    it('should return a promise', function () {
        let promise = getOvertimeForDirectory("spec/support/", false);
        expect(promise).toBeInstanceOf(Promise);
        return promise;
    });

    it('should return a result with correctly calculated overtime value', async function () {
        let result = await getOvertimeForDirectory("spec/support/", false);
        expect(moment.isDuration(result)).toBeTrue();
        expect(result.as("minutes")).toEqual(-491);
        expect(result.as("hours")).toEqual(-491/60);
    });

    it('should return an error if the directory does not exist', async function () {
        let error: Error;
        try {
            await getOvertimeForDirectory("spec/support2/", false);
        } catch (e) {
            error = e;
        }
        expect(error).toBeDefined();
        expect(error.message).toEqual("ENOENT: no such file or directory, scandir 'spec/support2/'");
    });
});
