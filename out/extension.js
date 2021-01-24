"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exec = exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const noCompiler_1 = require("./fixes/v426/noCompiler");
const backupIntell_1 = require("./fixes/v426/backupIntell");
const noDefines_1 = require("./fixes/v425/noDefines");
const shared = require("./shared");
const cCppPropObject_1 = require("./cCppPropObject");
const consts = require("./consts");
const tagIncludes_1 = require("./fixes/v425/tagIncludes");
const compileCommands_1 = require("./compileCommands");
const invalidPaths_1 = require("./fixes/v426/invalidPaths");
//import { CommandObject } from './ntypes';
const console = require("./console");
async function activate(context) {
    console.log('Extension "UE4 Intellisense Fixes" is now active!');
    context.subscriptions.push(vscode.commands.registerCommand("UE4IntellisenseFixes.showLog", () => {
        var _a;
        (_a = console.outputChannel) === null || _a === void 0 ? void 0 : _a.show(true);
    }));
    // Don't add a command to exec fixes. This must run on startup to run the fixes before Tag Parser starts adding unneeded symbols to cache.
    exec(); // TODO
}
exports.activate = activate;
function deactivate() {
    if (console.outputChannel) {
        console.outputChannel.dispose();
    }
}
exports.deactivate = deactivate;
async function exec() {
    const statusItem = createAndShowMainStatusItem();
    const ue4Version = await getUE4Version();
    if (ue4Version === 0 /* none */) {
        console.log("Didn't detect UE4 project.\n");
        return;
    }
    if (ue4Version === 1 /* v426 */) {
        console.log("Detected UE 4.26 project.\n");
        await fixUE4Project426(ue4Version);
    }
    else if (ue4Version === 2 /* v425 */) {
        console.log("Detected UE 4.25 project.\n");
        await fixUE4Project425();
    }
    statusItem.text = consts.MAIN_STATUS_TEXT_DONE;
    await shared.delay(consts.MAIN_STATUS_LIFE);
    statusItem.dispose();
    console.log("\nExtension is done.");
}
exports.exec = exec;
async function getUE4Version() {
    const ue4WorkspaceFolder = shared.getUE4WorkspaceFolder();
    if (!ue4WorkspaceFolder) {
        return 0 /* none */;
    }
    const scopeMainWorkspace = await shared.getUE4ProjectsMainWorkspace();
    if (!scopeMainWorkspace) {
        return 0 /* none */;
    }
    const extensionSettings = vscode.workspace.getConfiguration(consts.CONFIG_SECTION_EXTENSION, scopeMainWorkspace);
    const ue4Versions = new Map([
        [2 /* v425 */, extensionSettings.get(consts.CONFIG_SETTING_425_PATH_SUBSTRING, consts.UE4_425_DIR_FOLDER_NAME)],
        [1 /* v426 */, extensionSettings.get(consts.CONFIG_SETTING_426_PATH_SUBSTRING, consts.UE4_426_DIR_FOLDER_NAME)]
    ]);
    const result = Array.from(ue4Versions.keys()).find(key => {
        const pathSubstring = ue4Versions.get(key);
        if (!pathSubstring) {
            return false;
        }
        return ue4WorkspaceFolder.uri.fsPath.includes(pathSubstring);
    });
    if (!result) {
        return 0 /* none */;
    }
    return result;
}
async function fixUE4Project426(ue4Version) {
    var _a, _b;
    const mainWorkspaceFolder = await shared.getUE4ProjectsMainWorkspace();
    const ue4WorkspaceFolder = shared.getUE4WorkspaceFolder();
    if (!mainWorkspaceFolder || !ue4WorkspaceFolder) {
        return;
    }
    const extensionSettings = vscode.workspace.getConfiguration(consts.CONFIG_SECTION_EXTENSION, mainWorkspaceFolder);
    const isCompileCommandsFixEnabled = extensionSettings.get(consts.CONFIG_SETTING_426_ENABLE_COMPILE_COMMANDS_FIX);
    const isConverterFixEnabled = extensionSettings.get(consts.CONFIG_SETTING_426_ENABLE_CONVERTER_FIX);
    const isGeneralIncludesEnabled = false; //extensionSettings.get<boolean>(consts.CONFIG_SETTING_426_ENABLE_GENERIC_INC, false);
    if (!isCompileCommandsFixEnabled && !isConverterFixEnabled) {
        console.log("*** No Fixes Enabled ***\n");
        return;
    }
    // Data we use
    const ue4CCppPropertiesObject = new cCppPropObject_1.CCppPropertiesObject(ue4WorkspaceFolder);
    const mainCCppPropertiesObject = new cCppPropObject_1.CCppPropertiesObject(mainWorkspaceFolder);
    const ue4CCppPropertiesCopy = await ue4CCppPropertiesObject.getObjectCopy();
    const mainCCppPropertiesCopy = await mainCCppPropertiesObject.getObjectCopy();
    const mainCompileCommands = await getCompileCommands(mainWorkspaceFolder);
    if (!ue4CCppPropertiesCopy || !mainCCppPropertiesCopy || !mainCompileCommands) {
        return;
    }
    const firstUE4Configuration = (_a = ue4CCppPropertiesCopy === null || ue4CCppPropertiesCopy === void 0 ? void 0 : ue4CCppPropertiesCopy.configurations) === null || _a === void 0 ? void 0 : _a[0];
    const firstMainConfiguration = (_b = mainCCppPropertiesCopy === null || mainCCppPropertiesCopy === void 0 ? void 0 : mainCCppPropertiesCopy.configurations) === null || _b === void 0 ? void 0 : _b[0];
    if (!firstMainConfiguration || !firstUE4Configuration) {
        console.error(`Error with c_cpp_properties.json configurations: ${firstMainConfiguration} , ${firstUE4Configuration} . Try resettings your project.\n`);
        return;
    }
    // We don't need to fix invalid paths if we're not using them.
    if (!isGeneralIncludesEnabled) {
        //Fixes Invalid Paths in Compile Commands File
        invalidPaths_1.fixInvalidPaths(mainCompileCommands, extensionSettings);
    }
    // Fixes Compile Command file by adding blank compiler to every command:
    if (isCompileCommandsFixEnabled && !isConverterFixEnabled) {
        console.log("Compile Command's Fix is enabled\n");
        // Make sure compile command's path is set
        firstMainConfiguration.compileCommands = await getCompileCommandsPath(mainWorkspaceFolder);
        if (!firstMainConfiguration.compileCommands) {
            console.error("Couldn't set compile command's path! Try resetting your UE4 project.\n");
        }
        await noCompiler_1.fixNoCompiler(mainCompileCommands);
    }
    else {
        if (!isCompileCommandsFixEnabled && isConverterFixEnabled) {
            console.log("Converter Fix is enabled.\n");
        }
    }
    // Fixes wrong project
    firstUE4Configuration.name = getUE4DefaultConfigurationName(ue4Version);
    // Fixes backup intellisense
    await backupIntell_1.fixBackup(mainCCppPropertiesCopy, ue4CCppPropertiesCopy, mainCompileCommands, extensionSettings);
    // Enables Converter Fix: Removes compileCommand from main project's c_cpp_properties
    if (isConverterFixEnabled) {
        if (firstMainConfiguration) {
            firstMainConfiguration.compileCommands = undefined;
        }
        else {
            console.error("Converter fix failed! Try resetting your project and try again.\n");
            return;
        }
    }
    // Removes compileCommand from UE4 project's c_cpp_properties
    // This needs to be set with any fix so Tag Parser fix works correctly
    firstUE4Configuration.compileCommands = undefined;
    if (firstMainConfiguration.browse) {
        // For Tag Parser fix (it should be default set to true but we make sure)
        firstMainConfiguration.browse.limitSymbolsToIncludedHeaders = true;
        // We don't give error message. If this doesn't get set we have other problems that should produce logs.
    }
    if (mainCompileCommands.isDirty) {
        shared.writeJsonToFile(mainCompileCommands.path, mainCompileCommands.compileCommands);
        console.log(`Writing ${mainCompileCommands.path} to file`);
    }
    else {
        console.log("No need to write compile commands file. It was unchanged.");
    }
    await mainCCppPropertiesObject.writeIfNotEqual(mainCCppPropertiesCopy);
    await ue4CCppPropertiesObject.writeIfNotEqual(ue4CCppPropertiesCopy);
    return;
}
async function fixUE4Project425() {
    const mainWorkspaceFolder = await shared.getUE4ProjectsMainWorkspace();
    const ue4WorkspaceFolder = shared.getUE4WorkspaceFolder();
    if (!mainWorkspaceFolder || !ue4WorkspaceFolder) {
        return;
    }
    const extensionSettings = vscode.workspace.getConfiguration(consts.CONFIG_SECTION_EXTENSION, mainWorkspaceFolder);
    const isFixEnabled = extensionSettings.get(consts.CONFIG_SETTING_425_ENABLE_FIX);
    // No defines fix
    if (!isFixEnabled) {
        console.log("Fix is not enabled.\n");
    }
    await noDefines_1.fixNoDefines();
    console.log("End of No Defines.");
    // Tag Parser fix
    const ue4CCppProperties = new cCppPropObject_1.CCppPropertiesObject(ue4WorkspaceFolder);
    const ue4CCppPropertiesCopy = await ue4CCppProperties.getObjectCopy();
    await tagIncludes_1.fixTagIncludes(ue4CCppPropertiesCopy, ue4WorkspaceFolder);
    await ue4CCppProperties.writeIfNotEqual(ue4CCppPropertiesCopy);
    console.log("End of Tag Includes.");
    return;
}
function createAndShowMainStatusItem() {
    const statusItem = vscode.window.createStatusBarItem(consts.MAIN_STATUS_ALIGN, consts.MAIN_STATUS_PRIORITY);
    statusItem.text = consts.MAIN_STATUS_TEXT_FIXING;
    statusItem.command = consts.MAIN_STATUS_COMMAND;
    statusItem.show();
    return statusItem;
}
function getUE4DefaultConfigurationName(ue4Version) {
    let name = "";
    if (ue4Version === 2 /* v425 */) {
        name = "4.25";
    }
    else if (ue4Version === 1 /* v426 */) {
        name = "4.26";
    }
    return `Unreal Engine ${name} Source (Default)`;
}
async function getCompileCommands(workspace) {
    const uprojectName = await shared.getProjectsUProjectName();
    const globCompileCommands = shared.createGlobCompileCommandFileName(uprojectName);
    // Only get main workspace compile commands file. Later we remove the unneeded UE4 compile commands file from being used at all.
    const compileCommandURIs = await shared.findVSCodeFolderFiles(workspace, globCompileCommands);
    if (!(compileCommandURIs === null || compileCommandURIs === void 0 ? void 0 : compileCommandURIs.length)) {
        return;
    }
    let compileCommands = undefined;
    try {
        compileCommands = shared.jsonParseSafe(await shared.readJsonStringFromFile(compileCommandURIs[0].fsPath));
    }
    catch {
        return undefined;
    }
    return (compileCommands === null || compileCommands === void 0 ? void 0 : compileCommands.length) ? new compileCommands_1.CompileCommands(compileCommandURIs[0].fsPath, compileCommands) : undefined;
}
async function getCompileCommandsPath(mainWorkspace) {
    const projectName = await shared.getProjectsUProjectName();
    const globCompileCommandsFile = shared.createGlobCompileCommandFileName(projectName);
    const ccFiles = await shared.findVSCodeFolderFiles(mainWorkspace, globCompileCommandsFile);
    if (!(ccFiles === null || ccFiles === void 0 ? void 0 : ccFiles.length)) {
        console.error("Couldn't find Compile Commands file in .vscode directory. Will use includePaths instead.");
        return;
    }
    return ccFiles[0].fsPath;
}
//# sourceMappingURL=extension.js.map