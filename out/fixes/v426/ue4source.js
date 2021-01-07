"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixUE4Source = void 0;
const vscode = require("vscode");
const shared = require("../../shared");
const consts = require("../../consts");
const text_1 = require("../../text");
const console = require("../../console");
async function fixUE4Source(outUE4CCppProperties) {
    var _a;
    console.log("Attempting to fix UE4 Source Intellisense.");
    if (!((_a = outUE4CCppProperties === null || outUE4CCppProperties === void 0 ? void 0 : outUE4CCppProperties.configurations) === null || _a === void 0 ? void 0 : _a.length)) {
        console.error(`Bad outUE4CCppProperties for fixUE4Source(): ${outUE4CCppProperties}`);
        return;
    }
    fixIncludePath(outUE4CCppProperties.configurations[0]);
    fixBrowsePath(outUE4CCppProperties.configurations[0]);
    await fixForcedInclude(outUE4CCppProperties.configurations[0]);
    console.log("End UE4 Source.\n");
}
exports.fixUE4Source = fixUE4Source;
function fixIncludePath(outCCppConfig) {
    if (!outCCppConfig.includePath) {
        outCCppConfig.includePath = consts.CONFIG_VALUES_UE4_SOURCE_INCLUDE_PATHS;
        console.log("Fixing include path.");
        return;
    }
    else {
        for (const value of consts.CONFIG_VALUES_UE4_SOURCE_INCLUDE_PATHS) {
            if (!outCCppConfig.includePath.includes(value)) {
                outCCppConfig.includePath.push(value);
                console.log("Fixing include path.");
            }
        }
    }
}
function fixBrowsePath(outCCppConfig) {
    var _a, _b;
    if (!((_b = (_a = outCCppConfig.browse) === null || _a === void 0 ? void 0 : _a.path) === null || _b === void 0 ? void 0 : _b.length)) {
        console.log("Fixing browse path.");
        outCCppConfig.browse = {};
        outCCppConfig.browse.path = consts.CONFIG_VALUES_UE4_SOURCE_BROWSE_PATHS;
        return;
    }
    else {
        for (const value of consts.CONFIG_VALUES_UE4_SOURCE_BROWSE_PATHS) {
            if (!outCCppConfig.browse.path.includes(value)) {
                outCCppConfig.browse.path.push(value);
                console.log("Fixing browse path.");
            }
        }
    }
}
async function fixForcedInclude(outCCppConfig) {
    var _a;
    const forcedPath = await getForcedPath();
    if (!forcedPath) {
        vscode.window.showInformationMessage(text_1.TEXT_MESSAGE_BUILD_SUCCESSFUL_PROJECT, text_1.TEXT_OK);
        return;
    }
    // If forced path is already in forcedInclude
    if ((_a = outCCppConfig.forcedInclude) === null || _a === void 0 ? void 0 : _a.find(pathValue => shared.isEqualPaths(pathValue, forcedPath))) {
        return;
    }
    console.log("Fixing forced include.");
    outCCppConfig.forcedInclude = [
        consts.VSCODE_SPECIAL_VAR_DEFAULT,
        forcedPath
    ];
}
/**
 * Get the path to the definitions file needed for forcedInclude setting
 */
async function getForcedPath() {
    const mainWorkspace = await shared.getUE4ProjectsMainWorkspace();
    if (!mainWorkspace) {
        return;
    }
    const relPatern = new vscode.RelativePattern(mainWorkspace, consts.GLOB_DEFINITIONS_FILES);
    let definitionFiles;
    try {
        definitionFiles = await vscode.workspace.findFiles(relPatern);
    }
    catch (error) {
        console.error(`Error(${error.code}: finding files in getForcedPath().`);
        return;
    }
    if (!definitionFiles.length) {
        return;
    }
    // Use Development config definitions file if there
    const forcedPath = definitionFiles.find(uri => uri.fsPath.includes(consts.UE4_BUILD_CONFIGURATION_DEVELOPMENT));
    return forcedPath ? forcedPath.fsPath : definitionFiles[0].fsPath; // or just use first one found
}
//# sourceMappingURL=ue4source.js.map