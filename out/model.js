"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Model = void 0;
const shared = require("./shared");
const consts = require("./consts");
const console = require("./console");
/**
 * Refactorable first attempt but it works so...
 */
class Model {
    constructor() {
        this._cCppPropertiesInfo = {};
    }
    /**
     * Get copy of stored json object
     * @param workspace workspace where config is stored, workspace.name is used as a key
     */
    async getCCppPropertiesCopy(workspace) {
        if (!(workspace === null || workspace === void 0 ? void 0 : workspace.name)) {
            console.error("getCCppConfigCopy() was give an bad workspace.");
            return;
        }
        const key = workspace.name;
        if (this._cCppPropertiesInfo[key]) {
            const jsonString = JSON.stringify(this._cCppPropertiesInfo[key].cCppProperties);
            return JSON.parse(jsonString);
        }
        const foundCCppFiles = await shared.findVSCodeFolderFiles(workspace, consts.GLOB_C_CPP_PROPERTIES_FILENAME);
        if (!(foundCCppFiles === null || foundCCppFiles === void 0 ? void 0 : foundCCppFiles.length)) {
            console.log(`No ${key} ${consts.GLOB_C_CPP_PROPERTIES_FILENAME} files found for getCCppConfigCopy().`);
            return;
        }
        const path = foundCCppFiles[0].fsPath;
        const jsonString = await shared.readJsonStringFromFile(foundCCppFiles[0].fsPath);
        if (!jsonString) {
            console.error(`${key} ${consts.GLOB_C_CPP_PROPERTIES_FILENAME} file read as empty json string.`);
            return;
        }
        const jsonObject = shared.jsonParseSafe(jsonString);
        this._cCppPropertiesInfo[key] = { path: path, cCppProperties: jsonObject };
        if (!jsonObject) {
            return;
        }
        return JSON.parse(jsonString);
    }
    /**
     * Writes data to disk only if it doesn't match original
     * @param key
     * @param cCppProperties copy of orginal
     *
     * @todo Make this call a generic function that does the same thing?
     */
    async writeCCppProperties(workspace, cCppProperties) {
        if (!(workspace === null || workspace === void 0 ? void 0 : workspace.name)) {
            console.error(`Bad params in writeCCppProperties: ${!!(workspace === null || workspace === void 0 ? void 0 : workspace.name)}`);
            return;
        }
        if (!cCppProperties) {
            console.log("No need to write CCppProperties. It's undefined.");
            return;
        }
        const originalAsObject = this._cCppPropertiesInfo[workspace.name].cCppProperties;
        const originalString = JSON.stringify(originalAsObject, undefined, consts.JSON_SPACING);
        const copyString = JSON.stringify(cCppProperties, undefined, consts.JSON_SPACING);
        if (originalString === copyString) {
            console.log("No need to write CCppProperties. It was unchanged.");
            return;
        }
        console.log(`\nWriting ${this._cCppPropertiesInfo[workspace.name].path} to file.`);
        await shared.writeJsonToFile(this._cCppPropertiesInfo[workspace.name].path, copyString);
    }
}
exports.Model = Model;
//# sourceMappingURL=model.js.map