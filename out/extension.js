"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const nocompiler_1 = require("./fixes/v426/nocompiler");
const wrongproject_1 = require("./fixes/v426/wrongproject");
const ue4source_1 = require("./fixes/v426/ue4source");
const nodefines_1 = require("./fixes/v425/nodefines");
const shared_1 = require("./shared");
const model_1 = require("./model");
const consts = require("./consts");
const console = require("./console");
async function activate(context) {
    console.log('Extension "UE4 Intellisense Fixes" is now active!');
    const ue4Version = await getUE4Version();
    if (ue4Version === 0 /* none */) {
        console.log("Didn't detect UE4 project.\n");
        return;
    }
    if (ue4Version === 1 /* v426 */) {
        console.log("Detected UE 4.26 project.\n");
        await fixUE4Project426();
    }
    else if (ue4Version === 2 /* v425 */) {
        console.log("Detected UE 4.25 project.\n");
        await fixUE4Project425();
    }
    console.log("\nExtension is done.");
}
exports.activate = activate;
function deactivate() {
    if (console.outputChannel) {
        console.outputChannel.dispose();
    }
}
exports.deactivate = deactivate;
async function getUE4Version() {
    const ue4WorkspaceFolder = shared_1.getUE4WorkspaceFolder();
    if (!ue4WorkspaceFolder) {
        return 0 /* none */;
    }
    const scopeMainWorkspace = await shared_1.getUE4ProjectsMainWorkspace();
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
async function fixUE4Project426() {
    const mainWorkspaceFolder = await shared_1.getUE4ProjectsMainWorkspace();
    const extensionSettings = vscode.workspace.getConfiguration(consts.CONFIG_SECTION_EXTENSION, mainWorkspaceFolder);
    const isNoCompilerFixEnabled = extensionSettings.get(consts.CONFIG_SETTING_426_FIX_NO_COMPILER);
    const isWrongProjectFixEnabled = extensionSettings.get(consts.CONFIG_SETTING_426_FIX_WRONG_PROJECT);
    const isUE4SourceFixEnabled = extensionSettings.get(consts.CONFIG_SETTING_426_FIX_UE4_SOURCE);
    const model = new model_1.Model();
    let ue4CCppPropertiesCopy = undefined;
    if (isNoCompilerFixEnabled) {
        await nocompiler_1.fixNoCompiler();
    }
    else {
        console.log("No Compiler fix isn't enabled.");
    }
    if (isWrongProjectFixEnabled) {
        ue4CCppPropertiesCopy = ue4CCppPropertiesCopy ? ue4CCppPropertiesCopy : await model.getCCppPropertiesCopy(shared_1.getUE4WorkspaceFolder());
        await wrongproject_1.fixWrongProject(ue4CCppPropertiesCopy);
    }
    else {
        console.log("Wrong Project fix isn't enabled.");
    }
    if (isUE4SourceFixEnabled) {
        ue4CCppPropertiesCopy = ue4CCppPropertiesCopy ? ue4CCppPropertiesCopy : await model.getCCppPropertiesCopy(shared_1.getUE4WorkspaceFolder());
        await ue4source_1.fixUE4Source(ue4CCppPropertiesCopy);
    }
    else {
        console.log("UE4 Source fix isn't enabled.");
    }
    await model.writeCCppProperties(shared_1.getUE4WorkspaceFolder(), ue4CCppPropertiesCopy);
    return;
}
async function fixUE4Project425() {
    const mainWorkspaceFolder = await shared_1.getUE4ProjectsMainWorkspace();
    const extensionSettings = vscode.workspace.getConfiguration(consts.CONFIG_SECTION_EXTENSION, mainWorkspaceFolder);
    const isNoDefinesFixEnabled = extensionSettings.get(consts.CONFIG_SETTING_425_FIX_NO_DEFINES);
    if (isNoDefinesFixEnabled) {
        await nodefines_1.fixNoDefines();
        console.log("End of No Defines.");
    }
    else {
        console.log("Defines fix isn't enabled.");
    }
    return;
}
//# sourceMappingURL=extension.js.map