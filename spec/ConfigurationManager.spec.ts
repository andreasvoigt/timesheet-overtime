import {ConfigurationManager, IConfiguration} from "../src/ConfigurationManager";

require("jasmine-expect");


describe('ConfigurationManager', function () {

    it('should be defined', function () {
        expect(ConfigurationManager).toBeDefined();
    });

    describe("getInstance", () => {
        it('should be defined', function () {
            expect(ConfigurationManager.getInstance).toBeDefined();
            expect(ConfigurationManager.getInstance).toBeFunction();
        });

        it('should return an object of type ConfigurationManager', function () {
            expect(ConfigurationManager.getInstance().constructor.name).toEqual("ConfigurationManager");
        });
    });

    describe('get', function () {
        let instance: ConfigurationManager;

        beforeEach(() => {
            instance = ConfigurationManager.getInstance();
        });

        it('should be defined', function () {
            expect(instance.get).toBeDefined();
            expect(instance.get).toBeFunction();
        });

        it('should return the default configuration object if not specifically initialized', function () {
            expect(instance.get()).toEqual({
                dayWorkTime: "08:00:00",
                customWorkTimes: []
            });
        });
    });

    describe("reset", () => {
        let instance: ConfigurationManager;

        beforeEach(() => {
            instance = ConfigurationManager.getInstance();
        });

        it('should be defined', function () {
            expect(instance.reset).toBeDefined();
            expect(instance.reset).toBeFunction();
        });

        it('should reset the config to the initial values', function () {
            instance.init("spec/support/test_config1.json5");
            expect(instance.get()).not.toEqual({
                dayWorkTime: "08:00:00",
                customWorkTimes: []
            });
            instance.reset();
            expect(instance.get()).toEqual({
                dayWorkTime: "08:00:00",
                customWorkTimes: []
            });
        });
    });

    describe('init', function () {
        let instance: ConfigurationManager;

        beforeEach(() => {
            instance = ConfigurationManager.getInstance();
        });

        afterEach(() => {
            instance.reset();
        });

        it('should be defined', function () {
            expect(instance.init).toBeDefined();
            expect(instance.init).toBeFunction();
        });

        it('should load a config file set the value onto the internal config', function () {
            instance.init("spec/support/test_config1.json5");
            expect(instance.get()).toEqual({
                dayWorkTime: "04:00:00",
                customWorkTimes: [
                    {
                        from: "2021-08-01",
                        to: "2021-08-30",
                        workTimes: {
                            "3": "06:00:00"
                        }
                    }
                ]
            });
        });
    });

});
