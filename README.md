# timesheet-overtime

This is a small cli based tool to process csv export files from [Timesheet](https://play.google.com/store/apps/details?id=com.rauscha.apps.timesheet).
It will parse csv export files and calculate overtime work based on 8 h daily work time and a 5 day week.

## CLI

The application can be run by:

    node index.js

Call with `-h` to get help for possible parameters:

    node index.js -h

This will generate the following output:

![timesheet-overtime help console output](https://raw.githubusercontent.com/andreasvoigt/timesheet-overtime/master/help.png)

Executing with a single file or hole directory will produce an output like:

![timesheet-overtime example output](https://raw.githubusercontent.com/andreasvoigt/timesheet-overtime/master/example-output.png)

## License

timesheet-overtime is licensed unter MIT License.