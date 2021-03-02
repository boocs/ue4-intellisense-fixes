"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRegExpFrom = exports.delay = exports.isEqualPaths = exports.findVSCodeFolderFiles = exports.createGlobCompileCommandFileName = exports.jsonParseSafe = exports.writeJsonToFileSync = exports.writeJsonToFile = exports.readStringFromFileSync = exports.readStringFromFile = void 0;
const vscode = require("vscode");
const path = require("path");
const fs_1 = require("fs");
const fsSync = require("fs");
const consts = require("./consts");
const text = require("./text");
const console = require("./console");
/**
 * Asynchronously reads string from file
 *
 * @param path
 * @param encoding Default 'utf-8'
 *
 * @returns returns undefined on failure
 *
 * @logs console.error Error.code
 */
async function readStringFromFile(path, encoding = consts.ENCODING_UTF_8) {
    try {
        return await fs_1.promises.readFile(path, encoding);
    }
    catch (error) {
        console.error(`Error reading ${path}. Message: ${error.message}; Reason: ${error.code}`);
        return undefined;
    }
}
exports.readStringFromFile = readStringFromFile;
/**
 * Synchronously reads string from file
 *
 * @param path
 * @param encoding Default 'utf-8'
 *
 * @returns returns undefined on failure
 *
 * @logs console.error Error.code
 */
function readStringFromFileSync(path, encoding = consts.ENCODING_UTF_8) {
    try {
        return fsSync.readFileSync(path, encoding);
    }
    catch (error) {
        console.error(`Error reading ${path}. Message: ${error.message}; Reason: ${error.code}`);
        return undefined;
    }
}
exports.readStringFromFileSync = readStringFromFileSync;
/**
 * Asynchronously write json to file
 *
 * @param path
 * @param data Any data except string will use JSON.stringify
 * @param encoding Default 'utf-8'
 * @logs console.error Error.code
 */
async function writeJsonToFile(path, data, encoding = consts.ENCODING_UTF_8, spacing = consts.JSON_SPACING) {
    try {
        const writeData = typeof data === "string" ? data : JSON.stringify(data, undefined, spacing);
        await fs_1.promises.writeFile(path, writeData, encoding);
        return;
    }
    catch (error) {
        console.error(`Error writing json file. Message: ${error.message}; Reason: ${error.code}`);
        return;
    }
}
exports.writeJsonToFile = writeJsonToFile;
/**
 * Synchronously write json to file
 *
 * @param path
 * @param data Any data except string will use JSON.stringify
 * @param encoding Default 'utf-8'
 * @logs console.error Error.code
 */
function writeJsonToFileSync(path, data, encoding = consts.ENCODING_UTF_8, spacing = consts.JSON_SPACING) {
    try {
        const writeData = typeof data === "string" ? data : JSON.stringify(data, undefined, spacing);
        fsSync.writeFileSync(path, writeData, encoding);
    }
    catch (error) {
        console.error(`Error writing json file. Message: ${error.message}; Reason: ${error.code}`);
        return;
    }
}
exports.writeJsonToFileSync = writeJsonToFileSync;
/**
 * For when we first parse outside data.
 * @param data
 * @returns undefined on error
 * @logs console.error
 */
function jsonParseSafe(data) {
    try {
        return JSON.parse(data);
    }
    catch (error) {
        console.error(`JSON string was malformed and can't be parsed. Message: ${error.message}`);
        return undefined;
    }
}
exports.jsonParseSafe = jsonParseSafe;
/**
 * Defaults to univeral every compile command file
 *
 * @param nameSuffix compileCommands_nameSuffix.json
 */
function createGlobCompileCommandFileName(nameSuffix = "*") {
    return `compileCommands_${nameSuffix}.json`;
}
exports.createGlobCompileCommandFileName = createGlobCompileCommandFileName;
/**
 * @param workspaceFolder null will find files in all workspaces
 * @param globFilename This param will always be appended with ".vscode/"
 * @log console.log Can't find files or workspace undefined
 *
 */
async function findVSCodeFolderFiles(workspaceFolder, globFilename) {
    if (workspaceFolder === undefined) {
        console.log("Workspace undefined. Won't find files in .vscode folder.");
        return;
    }
    const glob = `.vscode/${globFilename}`;
    const include = !workspaceFolder ? glob : new vscode.RelativePattern(workspaceFolder, glob);
    let foundFiles;
    try {
        foundFiles = await vscode.workspace.findFiles(include);
    }
    catch (error) {
        console.error(`Error finding ${globFilename}, ${workspaceFolder === null || workspaceFolder === void 0 ? void 0 : workspaceFolder.name} workspace, with findVSCodeFolderFiles()`);
        return;
    }
    if (!(foundFiles === null || foundFiles === void 0 ? void 0 : foundFiles.length)) {
        console.log(`Couldn't find files in ${workspaceFolder === null || workspaceFolder === void 0 ? void 0 : workspaceFolder.name} workspace's .vscode folder with glob: ${glob}`);
        return;
    }
    return foundFiles;
}
exports.findVSCodeFolderFiles = findVSCodeFolderFiles;
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
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.delay = delay;
/**
 *
 * @param regExpString Format: "re/flags" : The '/' is required but flags are optional
 */
function createRegExpFrom(regExpString) {
    // Build regex and regex flags from string
    const reSeparatedArray = regExpString.split(consts.RE_SEPARATOR);
    const regexFlags = regExpString.endsWith(consts.RE_SEPARATOR) ? undefined : reSeparatedArray.pop();
    const regexString = reSeparatedArray.join(consts.RE_SEPARATOR);
    try {
        return new RegExp(regexString, regexFlags);
    }
    catch (error) {
        console.error(`RegExp was invalid: reString: ${regexString} , reFlags: ${regexFlags}`);
        vscode.window.showErrorMessage(text.INVALID_REGEX, text.OK);
        throw error;
    }
}
exports.createRegExpFrom = createRegExpFrom;
//# sourceMappingURL=shared.js.map