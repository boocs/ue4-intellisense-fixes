"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CCppProperties = void 0;
const fs = require("fs");
const shared = require("../shared");
const consts = require("../consts");
const console = require("../console");
class CCppProperties {
    constructor(workspace) {
        this._isValid = false;
        this._workspace = workspace;
        this._cCppPropertiesPath = undefined;
        this._cCppPropertiesJson = undefined;
    }
    get isValid() {
        return this._isValid;
    }
    get configurations() {
        var _a;
        return (_a = this._cCppPropertiesJson) === null || _a === void 0 ? void 0 : _a.configurations;
    }
    get workspace() {
        return this._workspace;
    }
    get path() {
        return this._cCppPropertiesPath;
    }
    /**
     * Creates the CCppProperties and stores it in the class
     * @logs console.error
     */
    async initialize() {
        const workspace = this.workspace;
        if (!workspace) {
            console.error("getCCppConfig() was given an undefined workspace.");
            return;
        }
        if (this._cCppPropertiesJson) { // Check if already initialized
            console.log("cCppProperties is already initialized.");
            return;
        }
        const foundCCppFiles = await shared.findVSCodeFolderFiles(workspace, consts.GLOB_C_CPP_PROPERTIES_FILENAME);
        if (!(foundCCppFiles === null || foundCCppFiles === void 0 ? void 0 : foundCCppFiles.length)) {
            console.error(`No files found for getCCppConfigCopy().`);
            return;
        }
        this._cCppPropertiesPath = foundCCppFiles[0].fsPath;
        this._cCppPropertiesJson = this.getCurrentCCppProperties(this.path);
        if (!this._cCppPropertiesJson) {
            return;
        }
        this._isValid = true;
    }
    /**
     * Compares file to orginal but only copies/writes configurations var if not equal
     */
    writeConfigurationsIfNotEqual() {
        var _a, _b;
        if (!this._isValid) {
            console.error("This c_cpp_properties.json isn't validated. Can't write.");
            return;
        }
        if (!this._cCppPropertiesJson) {
            console.log("No need to write CCppProperties. It's undefined.");
            return;
        }
        const modifiedCCppProperties = this._cCppPropertiesJson;
        const currentCCppProperties = this.getCurrentCCppProperties(this.path);
        if (!currentCCppProperties) {
            console.error(`Couldn't get currrent ${this.workspace} c_cpp_properties.json for comparison. Try resetting your project.`);
            return;
        }
        const modifiedCCppPropertiesString = JSON.stringify(modifiedCCppProperties, undefined, consts.JSON_SPACING);
        let currentCCppPropertiesString = JSON.stringify(currentCCppProperties, undefined, consts.JSON_SPACING);
        if (modifiedCCppPropertiesString === currentCCppPropertiesString) {
            console.log(`No need to write ${(_a = this.workspace) === null || _a === void 0 ? void 0 : _a.name} CCppProperties. It was unchanged.`);
            return;
        }
        if (!(this.path && fs.existsSync(this.path))) {
            console.error(`${(_b = this.workspace) === null || _b === void 0 ? void 0 : _b.name} CCppProperties path is invalid. Will not write.`);
            return;
        }
        console.log(`\nWriting ${this.path} to file.`);
        currentCCppProperties.configurations = modifiedCCppProperties.configurations;
        currentCCppPropertiesString = JSON.stringify(currentCCppProperties, undefined, consts.JSON_SPACING);
        shared.writeJsonToFileSync(this.path, currentCCppPropertiesString);
    }
    getCurrentCCppProperties(path) {
        var _a, _b;
        if (!path) {
            console.error(`No path for ${(_a = this.workspace) === null || _a === void 0 ? void 0 : _a.name} CCppProperties file found.`);
            return;
        }
        // Needs to be synchronous for when we read and then write in our write function
        const currentFileString = shared.readStringFromFileSync(path);
        if (!currentFileString) {
            console.error(`Error while reading ${(_b = this.workspace) === null || _b === void 0 ? void 0 : _b.name} CCppProperties file.`);
            return;
        }
        return shared.jsonParseSafe(currentFileString);
    }
}
exports.CCppProperties = CCppProperties;
//# sourceMappingURL=cCppProperties.js.map