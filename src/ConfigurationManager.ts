import {parse} from "json5";
import {readFileSync} from "fs";

interface IConfiguration {
    dayWorkTime?: string;
}

export class ConfigurationManager {
    private static instance: ConfigurationManager;

    private config: IConfiguration;

    private constructor() {
        this.config = {
            dayWorkTime: "08:00:00"
        };
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
}
