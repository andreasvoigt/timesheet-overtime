import {parse} from "json5";
import {readFileSync} from "fs";

export interface ICustomWorkTime {
    from: string;
    to: string;
    workTimes: {
        0?: string;
        1?: string;
        2?: string;
        3?: string;
        4?: string;
        5?: string;
        6?: string;
    }
}

export interface IConfiguration {
    dayWorkTime: string;
    customWorkTimes?: Array<ICustomWorkTime>
}

export class ConfigurationManager {
    private static instance: ConfigurationManager;

    private config: IConfiguration;

    private constructor() {
        this.reset();
    }

    public static getInstance(): ConfigurationManager {
        if (!ConfigurationManager.instance) {
            ConfigurationManager.instance = new ConfigurationManager();
        }

        return ConfigurationManager.instance;
    }

    public init(pathToConfig: string) {
        const fileContent = readFileSync(pathToConfig, {encoding: "utf8"});
        this.config = parse(fileContent);
    }

    public get(): IConfiguration {
        return this.config;
    }

    public reset() {
        this.config = {
            dayWorkTime: "08:00:00",
            customWorkTimes: []
        };
    }
}
