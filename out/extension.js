"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const CCResponseFixable_1 = require("./extension/CCResponseFixable");
const V425fixable_1 = require("./extension/V425fixable");
const projectUE4_1 = require("./project/projectUE4");
const consts = require("./consts");
const shared_1 = require("./shared");
const console = require("./console");
let resetEventFileWatcher;
let isExtensionRunning = false;
async function activate(context) {
    console.log('Extension "UE4 Intellisense Fixes" is now active!\n');
    context.subscriptions.push(vscode.commands.registerCommand("UE4IntellisenseFixes.showLog", () => {
        var _a;
        (_a = console.outputChannel) === null || _a === void 0 ? void 0 : _a.show(true);
    }));
    const statusItem = createAndShowMainStatusItem();
    // Don't add a command to run fixes. This must run on startup to run the fixes before Tag Parser starts adding unneeded symbols to cache.
    const fixableProject = await runExtension();
    resetEventFileWatcher = createResetEventFileWatcher(fixableProject === null || fixableProject === void 0 ? void 0 : fixableProject.project);
    resetEventFileWatcher === null || resetEventFileWatcher === void 0 ? void 0 : resetEventFileWatcher.onDidChange(async (e) => {
        if (isExtensionRunning) {
            return;
        }
        isExtensionRunning = true;
        console.log("Detected reset. About to run extension.\n");
        await shared_1.delay(consts.ON_RESET_WAIT_BEFORE_RUNNING_EXT);
        await runExtension();
        isExtensionRunning = false;
    });
    await endRun(statusItem);
}
exports.activate = activate;
function deactivate() {
    var _a;
    (_a = console.outputChannel) === null || _a === void 0 ? void 0 : _a.dispose();
    resetEventFileWatcher === null || resetEventFileWatcher === void 0 ? void 0 : resetEventFileWatcher.dispose();
}
exports.deactivate = deactivate;
async function runExtension() {
    let fixableProject = await getFixableProject();
    if (!fixableProject) {
        console.error("No fixable project could be created.\n");
    }
    else {
        await fixableProject.execFixes();
    }
    return fixableProject;
}
function createAndShowMainStatusItem() {
    const statusItem = vscode.window.createStatusBarItem(consts.MAIN_STATUS_ALIGN, consts.MAIN_STATUS_PRIORITY);
    statusItem.text = consts.MAIN_STATUS_TEXT_FIXING;
    statusItem.command = consts.MAIN_STATUS_COMMAND;
    statusItem.show();
    return statusItem;
}
function getFixesEnabledSettings() {
    const extensionSettings = vscode.workspace.getConfiguration(consts.CONFIG_SECTION_EXTENSION);
    const isFixesEnabled = extensionSettings.get(consts.CONFIG_SETTING_ENABLE_FIXES, false);
    const isOptionalFixesEnabled = extensionSettings.get(consts.CONFIG_SETTING_ENABLE_OPTIONAL_FIXES, false);
    return { isFixesEnabled: isFixesEnabled, isOptionalFixesEnabled: isOptionalFixesEnabled };
}
async function endRun(statusItem) {
    console.log("\nExtension is done.");
    statusItem.text = consts.MAIN_STATUS_TEXT_DONE;
    await shared_1.delay(consts.MAIN_STATUS_LIFE);
    statusItem.dispose();
    return;
}
async function getFixableProject() {
    await projectUE4_1.ProjectUE4.loadUE4Version();
    const version = projectUE4_1.ProjectUE4.ue4VersionObject;
    const fixesEnabledSettings = getFixesEnabledSettings();
    if (!version) {
        console.error("Couldn't parse Unreal Engine version.");
        return;
    }
    console.log(`Found Unreal Engine v${version.major}.${version.minor}.${version.patch}\n`);
    if (version.major !== 4) {
        return;
    }
    if (version.minor === 25) {
        return new V425fixable_1.V425Fixable(fixesEnabledSettings.isFixesEnabled, fixesEnabledSettings.isOptionalFixesEnabled);
    }
    else if (version.minor === 26) {
        if (version.patch > 0) {
            return new CCResponseFixable_1.CCResponseFixable(fixesEnabledSettings.isFixesEnabled, fixesEnabledSettings.isOptionalFixesEnabled);
        }
        else { // We don't support 4.26.0
            console.log("Unreal Engine version 4.26.0 is no longer supported.");
            return;
        }
    }
    return;
}
function createResetEventFileWatcher(projectUE4) {
    const mainWorkspace = projectUE4 === null || projectUE4 === void 0 ? void 0 : projectUE4.mainWorkspaceFolder;
    if (!mainWorkspace) {
        console.error("Project didn't have a main workspace folder. File watcher will not be created.");
        return;
    }
    const relPattern = new vscode.RelativePattern(mainWorkspace, consts.GLOB_PROJECT_RESET_FILE_CREATION);
    return vscode.workspace.createFileSystemWatcher(relPattern, true, false, true);
}
//# sourceMappingURL=extension.js.map