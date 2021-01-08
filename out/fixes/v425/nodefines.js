"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixNoDefines = void 0;
const vscode = require("vscode");
const model_1 = require("../../model");
const shared = require("../../shared");
const consts = require("../../consts");
const text_1 = require("../../text");
const console = require("../../console");
async function fixNoDefines() {
    var _a, _b;
    console.log("Attempting to fix No Defines.");
    const mainWorkspace = await shared.getUE4ProjectsMainWorkspace();
    const model = new model_1.Model();
    const mainCCppProperties = await model.getCCppPropertiesCopy(mainWorkspace);
    if (!((_a = mainCCppProperties === null || mainCCppProperties === void 0 ? void 0 : mainCCppProperties.configurations) === null || _a === void 0 ? void 0 : _a.length)) {
        console.error("No main workspace c_cpp_properties/configurations found.");
        return;
    }
    if ((_b = mainCCppProperties.configurations[0].defines) === null || _b === void 0 ? void 0 : _b.length) {
        console.log("c_cpp_properties already has defines. No fix needed.");
    }
    const cppSetting = vscode.workspace.getConfiguration(consts.CONFIG_SECTION_C_CPP);
    const forcedIncludePaths = cppSetting.get(consts.CONFIG_SETTING_DEFAULT_FORCED_INCLUDE);
    const hasForcedDefinesFile = forcedIncludePaths === null || forcedIncludePaths === void 0 ? void 0 : forcedIncludePaths.some(value => {
        return value.includes(consts.QUICK_CHECKER_DEFINITIONS_FILE);
    });
    if (hasForcedDefinesFile) {
        console.log("Already has defines file in forced include. No fix needed.");
        return;
    }
    else {
        await addDefinesToForcedInclude(mainWorkspace, cppSetting, forcedIncludePaths);
    }
}
exports.fixNoDefines = fixNoDefines;
async function addDefinesToForcedInclude(mainWorkspace, cppSettings, forcedIncludePaths) {
    if (!mainWorkspace) {
        console.error("Error: No main workspace.");
        return;
    }
    const relPatternMainWorkspaceDefineFiles = new vscode.RelativePattern(mainWorkspace, consts.GLOB_DEFINITIONS_FILES);
    let definesUris = undefined;
    try {
        definesUris = await vscode.workspace.findFiles(relPatternMainWorkspaceDefineFiles);
    }
    catch (error) {
        console.error("Error finding defines files.");
        return;
    }
    if (!(definesUris === null || definesUris === void 0 ? void 0 : definesUris.length)) {
        vscode.window.showInformationMessage(text_1.TEXT_MESSAGE_BUILD_SUCCESSFUL_PROJECT, text_1.TEXT_OK);
        return;
    }
    let definitionsUri = definesUris.find(value => {
        return value.fsPath.includes(consts.UE4_BUILD_CONFIGURATION_DEVELOPMENT); // Use development version if there
    });
    if (!definitionsUri) {
        definitionsUri = definesUris[0]; // else just use first found defines file
    }
    if (!forcedIncludePaths) {
        forcedIncludePaths = [definitionsUri.fsPath];
    }
    else {
        forcedIncludePaths.push(definitionsUri.fsPath);
    }
    try {
        console.log("Fixing No Defines.");
        await cppSettings.update(consts.CONFIG_SETTING_DEFAULT_FORCED_INCLUDE, forcedIncludePaths, false);
    }
    catch (error) {
        console.error("Error trying to update Forced Include setting.");
        return;
    }
}
//# sourceMappingURL=nodefines.js.map