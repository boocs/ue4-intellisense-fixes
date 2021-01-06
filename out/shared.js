"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEqualPaths = exports.getUE4ProjectsMainWorkspace = exports.getProjectsUProjectPath = exports.findVSCodeFolderFiles = exports.getProjectsUProjectName = exports.getUProjectFiles = exports.getUE4Path = exports.getUE4WorkspaceFolder = exports.getGlobCompileCommandFiles = exports.jsonParseSafe = exports.writeJsonToFile = exports.readJsonStringFromFile = void 0;
const path = require("path");
const fs_1 = require("fs");
const vscode = require("vscode");
const consts = require("./consts");
const console = require("./console");
/**
 * @param path
 * @param encoding Default 'utf-8'
 *
 * @returns returns undefined on failure
 *
 * @logs console.error Error.code
 */
async function readJsonStringFromFile(path, encoding = consts.ENCODING_UTF_8) {
    try {
        return await fs_1.promises.readFile(path, encoding);
    }
    catch (error) {
        console.error(`Error reading file. Reason: ${error.code}`);
        return "";
    }
}
exports.readJsonStringFromFile = readJsonStringFromFile;
/**
 * @param path
 * @param data Any data except string will use JSON.stringify
 * @param encoding Default 'utf-8'
 * @returns true on success and undefined on failure
 *
 * @logs console.error Error.code
 */
async function writeJsonToFile(path, data, encoding = consts.ENCODING_UTF_8, spacing = consts.JSON_SPACING) {
    try {
        const writeData = typeof data === "string" ? data : JSON.stringify(data, undefined, spacing);
        await fs_1.promises.writeFile(path, writeData, encoding);
        return;
    }
    catch (error) {
        console.error(`Error writing json file. Reason: ${error.code}`);
        return;
    }
}
exports.writeJsonToFile = writeJsonToFile;
/**
 * For when we first parse outside data. Unneeded after since we'd want it to throw exceptions on our code
 * @param data
 * @returns undefined on error
 * @logs console.error
 */
function jsonParseSafe(data) {
    try {
        return JSON.parse(data);
    }
    catch (error) {
        console.error("JSON string was malformed and can't be parsed.");
        return undefined;
    }
}
exports.jsonParseSafe = jsonParseSafe;
/**
 * Defaults to finding all files located in a .vscode folder
 *
 * @param nameSuffix .vscode/compileCommands_nameSuffix.json
 */
function getGlobCompileCommandFiles(nameSuffix = "*") {
    return `.vscode/compileCommands_${nameSuffix}.json`;
}
exports.getGlobCompileCommandFiles = getGlobCompileCommandFiles;
/**
 * @returns If not valid vscode.WorkspaceFolder, returns undefined
 */
function getUE4WorkspaceFolder() {
    var _a;
    return (_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a.find(workspaceFolder => {
        return workspaceFolder.name === consts.WORKSPACE_FOLDER_NAME_UE4;
    });
}
exports.getUE4WorkspaceFolder = getUE4WorkspaceFolder;
function getUE4Path() {
    var _a;
    const ue4WorkspaceFolder = (_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a.find(workspaceFolder => {
        workspaceFolder.name === consts.WORKSPACE_FOLDER_NAME_UE4;
    });
    return !!ue4WorkspaceFolder ? ue4WorkspaceFolder.uri.fsPath : "";
}
exports.getUE4Path = getUE4Path;
/**
 * @param excludeUE4
 *
 * @logs console.error When no uproject files found.
 * @todo Can exclude pattern work somehow to filter out ue4 folder? This function still works with alternate exclude using filter.
 */
async function getUProjectFiles(excludeUE4 = true) {
    let uprojectFiles = await vscode.workspace.findFiles(consts.GLOB_ANY_UPROJECT_IN_TOPLEVEL);
    if (!(uprojectFiles === null || uprojectFiles === void 0 ? void 0 : uprojectFiles.length)) {
        console.error("No uproject files found.");
        return;
    }
    if (excludeUE4) {
        const ue4WorkspaceFolder = getUE4WorkspaceFolder();
        if (!ue4WorkspaceFolder) {
            return;
        }
        uprojectFiles = await Promise.all(uprojectFiles.filter(uri => {
            return !uri.fsPath.includes(ue4WorkspaceFolder.uri.fsPath);
        }));
    }
    return uprojectFiles;
}
exports.getUProjectFiles = getUProjectFiles;
/**
 * We assume a project has only 1 uproject file and return it's name (excluding the UE4 path). Empty string is returned otherwise.
 *
 * @logs console.error No uproject file found or multiple uproject files found
 */
async function getProjectsUProjectName() {
    const uprojectFiles = await getUProjectFiles();
    if (!(uprojectFiles === null || uprojectFiles === void 0 ? void 0 : uprojectFiles.length) || uprojectFiles.length > 1) {
        console.error(`Error in number of uproject files found: ${uprojectFiles === null || uprojectFiles === void 0 ? void 0 : uprojectFiles.length}`);
        return "";
    }
    return path.parse(uprojectFiles[0].fsPath).name;
}
exports.getProjectsUProjectName = getProjectsUProjectName;
/**
 * @param workspaceFolder null will find files in all workspaces
 * @param globFilename This param will always be appended with ".vscode/"
 * @log console.log Can't find files
 *
 */
async function findVSCodeFolderFiles(workspaceFolder, globFilename) {
    if (workspaceFolder === undefined) {
        return;
    }
    const glob = `.vscode/${globFilename}`;
    const include = !workspaceFolder ? glob : new vscode.RelativePattern(workspaceFolder, glob);
    const foundFiles = await vscode.workspace.findFiles(include);
    if (!(foundFiles === null || foundFiles === void 0 ? void 0 : foundFiles.length)) {
        console.log(`Couldn't find files in .vscode folder with glob: ${glob}`);
        return;
    }
    return foundFiles;
}
exports.findVSCodeFolderFiles = findVSCodeFolderFiles;
/**
 * @returns Note: Can return empty string
 */
async function getProjectsUProjectPath() {
    const uprojectFiles = await getUProjectFiles();
    if (!(uprojectFiles === null || uprojectFiles === void 0 ? void 0 : uprojectFiles.length) || uprojectFiles.length > 1) {
        console.error(`Error in number of uproject file paths: ${uprojectFiles === null || uprojectFiles === void 0 ? void 0 : uprojectFiles.length}`);
        return "";
    }
    return path.parse(uprojectFiles[0].fsPath).dir;
}
exports.getProjectsUProjectPath = getProjectsUProjectPath;
async function getUE4ProjectsMainWorkspace() {
    var _a;
    const mainWorkspacePath = await getProjectsUProjectPath();
    if (!((_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a.length)) {
        return;
    }
    return vscode.workspace.workspaceFolders.find(workspaceFolder => {
        return path.normalize(workspaceFolder.uri.fsPath) === path.normalize(mainWorkspacePath);
    });
}
exports.getUE4ProjectsMainWorkspace = getUE4ProjectsMainWorkspace;
function isEqualPaths(path1, path2) {
    try {
        return !path.relative(path1, path2);
    }
    catch (error) {
        console.error(`Error with path.relative: ${path1} === ${path2}`);
        return false;
    }
}
exports.isEqualPaths = isEqualPaths;
//# sourceMappingURL=shared.js.map