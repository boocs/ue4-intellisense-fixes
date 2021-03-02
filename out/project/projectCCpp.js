"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectCCpp = exports.CONFIG_SECTION_C_CPP = void 0;
const vscode = require("vscode");
const cCppProperties_1 = require("./cCppProperties");
const builderBase_1 = require("./builderBase");
const compileCommands_1 = require("./compileCommands");
const console = require("../console");
exports.CONFIG_SECTION_C_CPP = "C_Cpp";
class ProjectCCpp extends builderBase_1.ValidatedBuilderBase {
    constructor() {
        super();
    }
    async cCppPostConstructionSetup(setupVars) {
        let isValid = super.basePostConstructionSetup();
        if (!isValid) {
            return false;
        }
        const cCppSettings = this.createConfigurations(setupVars);
        const cCppProperties = await this.createProperties(setupVars);
        this._cCppSettings = cCppSettings;
        this._cCppProperties = cCppProperties;
        return true;
    }
    createConfigurations(setupVars) {
        const workspaceConfigurations = new Map();
        for (let [key, workspaceSetupVars] of Object.entries(setupVars)) {
            const workspace = workspaceSetupVars.configurationsWorkspace;
            if (workspace === undefined) {
                workspaceConfigurations.set(key, undefined);
                continue;
            }
            const configuration = vscode.workspace.getConfiguration(exports.CONFIG_SECTION_C_CPP, workspace);
            if (!configuration) {
                console.error(`Couldn't create ${workspace} workspace settings ${exports.CONFIG_SECTION_C_CPP} configuration;`);
                return undefined;
            }
            workspaceConfigurations.set(key, configuration);
        }
        return workspaceConfigurations;
    }
    async createProperties(setupVars) {
        const workspaceProperties = new Map();
        for (let [key, workspaceSetupVars] of Object.entries(setupVars)) {
            const workspace = workspaceSetupVars.propertiesWorkspace;
            if (workspace === undefined) {
                workspaceProperties.set(key, undefined);
                continue;
            }
            const properties = new cCppProperties_1.CCppProperties(workspace);
            await properties.initialize();
            if (!properties.isValid) {
                return undefined;
            }
            workspaceProperties.set(key, properties);
        }
        return workspaceProperties;
    }
    /**
     * VSCode workspace configuration settings (non c_cpp_properties.json)
     * @param key
     */
    getCCppSettingsConfig(workspaceKey) {
        if (this._cCppSettings) {
            const isKeyValid = this._cCppSettings.has(workspaceKey);
            if (!isKeyValid) {
                console.error(`${workspaceKey} in cCppSettings doesn't exits.`);
                return;
            }
            const settings = this._cCppSettings.get(workspaceKey);
            if (settings) {
                return settings;
            }
            else {
                console.error(`The ${workspaceKey} CCpp settings wasn't configured to be created at construction setup.`);
                return;
            }
        }
        else {
            console.error(`cCppSetting weren't created at construction setup.`);
            return;
        }
    }
    /**
     * @param workspaceKey
     * @returns undefined on error
     */
    getCCppProperties(workspaceKey) {
        if (this._cCppProperties) {
            const isKeyValid = this._cCppProperties.has(workspaceKey);
            if (!isKeyValid) {
                console.error(`${workspaceKey} in cCppProperties doesn't exits.`);
                return;
            }
            const properties = this._cCppProperties.get(workspaceKey);
            if (properties) {
                return properties;
            }
            else {
                console.error(`The ${workspaceKey} CCPP properties was configured to not be created at construction setup.`);
                return;
            }
        }
        else {
            console.error(`The ${workspaceKey} cCppProperties wasn't enabled at construction setup.`);
            return;
        }
    }
    /**
     * Configurations stored in the c_cpp_properties.json
     * @param workspaceKey
     * @param index
     */
    getCCppConfiguration(workspaceKey, index) {
        var _a;
        const configurations = (_a = this.getCCppProperties(workspaceKey)) === null || _a === void 0 ? void 0 : _a.configurations;
        if (!configurations) {
            console.log(`No ${workspaceKey} configurations found.`);
            return undefined;
        }
        const configuration = configurations === null || configurations === void 0 ? void 0 : configurations[index];
        if (!configuration) {
            console.error(`${workspaceKey} configuration at index ${index} does not exists.`);
            return undefined;
        }
        return configuration;
    }
    /**
     * @param workspaceKey defaults to undefined to save all stored c_cpp_properties.json files.
     */
    saveCCppProperties(workspaceKey = undefined) {
        if (!workspaceKey) {
            const allCCppProperties = this._cCppProperties;
            if (!allCCppProperties) {
                return;
            }
            for (let [workspaceKey, cCppProperties] of allCCppProperties) {
                cCppProperties === null || cCppProperties === void 0 ? void 0 : cCppProperties.writeConfigurationsIfNotEqual();
            }
            return;
        }
        const properties = this.getCCppProperties(workspaceKey);
        if (properties) {
            properties.writeConfigurationsIfNotEqual();
        }
    }
    /**
     * Validated creation
     *
     * @param workspaceKey
     * @param configIndex
     *
     * @returns false on error
     */
    loadCompileCommandsFromConfig(workspaceKey, configIndex) {
        var _a;
        if (!this._compileCommands) {
            this._compileCommands = new Map();
        }
        const cCppProperties = this.getCCppProperties(workspaceKey);
        if (!cCppProperties) {
            return false;
        }
        const compileCommandsPath = (_a = cCppProperties.configurations) === null || _a === void 0 ? void 0 : _a[configIndex].compileCommands;
        if (!compileCommandsPath) {
            console.error(`Error getting compile commands path from ${workspaceKey} c_cpp_properties.json at config index ${configIndex}.`);
            return false;
        }
        const compileCommands = new compileCommands_1.CompileCommands(compileCommandsPath);
        if (!compileCommands.isValid) {
            return false;
        }
        if (!this._compileCommands.has(workspaceKey)) {
            this._compileCommands.set(workspaceKey, new Map());
        }
        const workspaceCompileCommands = this._compileCommands.get(workspaceKey);
        if (!workspaceCompileCommands) {
            console.error(`${workspaceKey} Compile Commands wasn't set.`);
            return false;
        }
        workspaceCompileCommands.set(configIndex.toString(), compileCommands);
        return true;
    }
    getCompileCommandsAtConfigIndex(workspaceKey, configIndex) {
        var _a, _b;
        return (_b = (_a = this._compileCommands) === null || _a === void 0 ? void 0 : _a.get(workspaceKey)) === null || _b === void 0 ? void 0 : _b.get(configIndex.toString());
    }
}
exports.ProjectCCpp = ProjectCCpp;
//# sourceMappingURL=projectCCpp.js.map