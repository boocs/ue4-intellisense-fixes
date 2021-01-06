"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixWrongProject = void 0;
const vscode = require("vscode");
const shared = require("../../shared");
const consts_1 = require("../../consts");
const console = require("../../console");
/**
 * When switching to a different project, UE4 4.26 will have the old project's compileCommand path
 * in it's c_cpp_properties.json file.
 */
async function fixWrongProject(outCCppProperties) {
    var _a;
    console.log("Attempting to fix wrong project.");
    // Only fix first config found
    const config = (_a = outCCppProperties === null || outCCppProperties === void 0 ? void 0 : outCCppProperties.configurations) === null || _a === void 0 ? void 0 : _a[0];
    if (!config) {
        console.error("CCppProperties param error in fixWrongProject()");
        return;
    }
    await fixCompileCommandPath(config);
    await fixName(config);
    console.log("End wrong project.\n");
}
exports.fixWrongProject = fixWrongProject;
async function fixCompileCommandPath(outCCppConfig) {
    const uprojectName = await shared.getProjectsUProjectName();
    // @todo Set name as well? 
    const correctedPath = await getCorrectCompileCommandPath(uprojectName, outCCppConfig.compileCommands);
    if (!correctedPath) {
        return;
    }
    console.log("Changing config's path.");
    outCCppConfig.compileCommands = correctedPath;
}
async function fixName(outCCppConfig) {
    var _a, _b;
    const mainCCppPropertiesFiles = await shared.findVSCodeFolderFiles(await shared.getUE4ProjectsMainWorkspace(), consts_1.GLOB_C_CPP_PROPERTIES_FILENAME);
    if (!(mainCCppPropertiesFiles === null || mainCCppPropertiesFiles === void 0 ? void 0 : mainCCppPropertiesFiles.length)) {
        console.error("Couldn't find main workspace's c_cpp_properties.json.");
        return;
    }
    // First file found
    const mainCCppProperties = JSON.parse(await shared.readJsonStringFromFile(mainCCppPropertiesFiles[0].fsPath));
    // First config
    const mainCCppConfigName = (_b = (_a = mainCCppProperties === null || mainCCppProperties === void 0 ? void 0 : mainCCppProperties.configurations) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.name;
    if (!mainCCppConfigName) {
        console.error("Bad mainCCppProperties in mainCCppPropertiesFiles.");
    }
    if (outCCppConfig.name !== mainCCppConfigName) {
        outCCppConfig.name = mainCCppConfigName;
    }
}
/**
 * Return the current project's compileCommands_ProjectName.json in the UE4's .vscode folder. Uses a glob pattern to search for it.
 *
 * @param uprojectName
 * @param compileCommandsPath
 * @returns Empty string on error or compileCommandsPath is correct
 *
 * @logs console.log When no fixes needed
 * @logs console.error When no fix on errors
 */
async function getCorrectCompileCommandPath(uprojectName, compileCommandsPath) {
    if (!compileCommandsPath) {
        // This is legacy from when trying settings.json. This will probably never be blank. Still will keep...
        console.log("Configs compile commands path is blank. Assuming using alternative fix.");
        return "";
    }
    if (compileCommandsPath.endsWith(`/compileCommands_${uprojectName}.json`) || compileCommandsPath.endsWith(`\\compileCommands_${uprojectName}.json`)) {
        console.log("Config's compile commands path is correct.");
        return "";
    }
    const ue4WorkspaceFolder = shared.getUE4WorkspaceFolder();
    if (!ue4WorkspaceFolder) {
        return "";
    }
    const relativePattern = new vscode.RelativePattern(ue4WorkspaceFolder, shared.getGlobCompileCommandFiles(uprojectName));
    const projectCompileCommandFile = await vscode.workspace.findFiles(relativePattern, undefined, 1);
    if (!(projectCompileCommandFile === null || projectCompileCommandFile === void 0 ? void 0 : projectCompileCommandFile.length)) {
        console.error("No project's compile command file found in UE4's .vscode folder.");
        return "";
    }
    return projectCompileCommandFile[0].fsPath;
}
//# sourceMappingURL=wrongproject.js.map