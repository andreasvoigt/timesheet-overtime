# timesheet-overtime

This is a small cli based tool to process csv export files from [Timesheet](https://play.google.com/store/apps/details?id=com.rauscha.apps.timesheet).
It will parse csv export files and calculate overtime work based on 8 h daily work time and a 5 day week.

[![CircleCI](https://circleci.com/gh/andreasvoigt/timesheet-overtime/tree/develop.svg?style=svg)](https://circleci.com/gh/andreasvoigt/timesheet-overtime/tree/develop)

## Installation and Execution

The program can be installed via

    npm i -g andreasvoigt/timesheet-overtime

Afterwards it can be run by

    timesheet-overtime -h

or 

    timesheet-overtime.cmd -h

for Windows.

## Configuration

The overtime calculation uses 8h workdays with a 5 workday (MO - FR) week as default configuration.
If you want to use custom configuration you can supply a <config>.json5 file using the `--config` parameter.

<pre>
{
  dayWorkTime: "08:00:00", // standard working time defined via HH:MM:SS
  customWorkTimes: [ // optional array of custom working time definitions
    {
      from: "YYYY-MM-DD", // supply at least 'from' or 'to'
      to: "YYYY-MM-DD",

      // a list of custom working time definitions:
      workTimes: {
        // "day": "custom-working-time as HH:MM:SS"
        // Define the day property as stringified number form 0 (sunday) to 6 (saturday)
        "3": "08:00:00",
        "4": "08:00:00",
        "5": "04:00:00"
      }
    }
  ]
}
</pre>

## Build

The application has to be build before running it:

    npm run build

## CLI

The application can be run by:

    node dist/src/index.js

Call with `-h` to get help for possible parameters:

    node dist/src/index.js -h

This will generate the following output:

![timesheet-overtime help console output](https://raw.githubusercontent.com/andreasvoigt/timesheet-overtime/master/help.png)

Executing with a single file or hole directory will produce an output like:

![timesheet-overtime example output](https://raw.githubusercontent.com/andreasvoigt/timesheet-overtime/master/example-output.png)

## License

timesheet-overtime is licensed unter MIT License.
