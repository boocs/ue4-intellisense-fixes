"use strict";
/**
 * Fixes invalid paths in the compile command's file
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixKnownInvalidPathsInFile = exports.fixAllResponseFileKnownInvalidPaths = void 0;
const fs_1 = require("fs");
const path = require("path");
const consts = require("../../consts");
const shared = require("../../shared");
const console = require("../../console");
function fixAllResponseFileKnownInvalidPaths(project) {
    console.log("Fixing invalid paths in response files.");
    const mainCompileCommands = project.getMainFirstConfigCompileCommands();
    const responsePaths = mainCompileCommands === null || mainCompileCommands === void 0 ? void 0 : mainCompileCommands.getAllUsedResponsePaths();
    if (!(responsePaths === null || responsePaths === void 0 ? void 0 : responsePaths.length)) {
        console.error("Couldn't find any response file paths.");
        return;
    }
    for (let index in responsePaths) {
        const filePath = responsePaths[index];
        const fixedFileString = fixKnownInvalidPathsInFile(filePath);
        if (!fixedFileString) {
            return;
        }
        try {
            fs_1.writeFileSync(filePath, fixedFileString, consts.ENCODING_UTF_8);
        }
        catch (error) {
            console.error(`Problem writing fixed response file: ${error.message}.`);
            return;
        }
    }
}
exports.fixAllResponseFileKnownInvalidPaths = fixAllResponseFileKnownInvalidPaths;
/**
 * @param value
 * @returns undefined if no fixes were made
 *
 * @logs all
 */
function fixKnownInvalidPathsInFile(responsePath) {
    const originalResponseString = shared.readStringFromFileSync(responsePath);
    if (!originalResponseString) {
        console.error("Couldn't read response file.");
        return;
    }
    const regExpAllIncludes = shared.createRegExpFrom(consts.RE_COMPILE_COMMAND_INCLUDE_PATHS);
    const matches = originalResponseString.match(regExpAllIncludes);
    if (!matches) {
        console.log("No includes found in response file.");
        return;
    }
    const invalidPaths = getInvalidWithValidPaths(matches);
    if (!invalidPaths.fixable.length) {
        console.log("No invalid paths returned.");
        return;
    }
    let replacementString = originalResponseString;
    for (const invalidPath of invalidPaths.fixable) {
        replacementString = replacementString.replace(invalidPath.invalid, invalidPath.valid);
        continue;
    }
    const parsedPath = path.parse(responsePath);
    console.log(`${parsedPath.name}: Fixed paths count(${invalidPaths.fixable.length}), Unfixed paths count(${invalidPaths.unfixable})`);
    return replacementString;
}
exports.fixKnownInvalidPathsInFile = fixKnownInvalidPathsInFile;
/**
 *
 * @param outPaths
 * @returns array of invalid/valid paths
 */
function getInvalidWithValidPaths(outPaths) {
    const reBadIncPath = new RegExp(consts.RE_COMPILE_COMMAND_INC_BAD_PATH);
    const reBadReliabilityPath = new RegExp(consts.RE_COMPILE_COMMAND_RELIABILITY_BAD_PATH);
    const paths = outPaths;
    const invalidStringsObject = { unfixable: 0, fixable: [] };
    for (const key in paths) {
        if (fs_1.existsSync(paths[key])) {
            continue; // Path exist so continue.
        }
        const currentPath = paths[key];
        // Bad Inc path fix
        if (checkAndReplacePathSubstring(paths, key, { reMatch: reBadIncPath, replace: consts.REPLACEMENT_NAME_INC_TO_DEVELOPEMENT })) {
            invalidStringsObject.fixable.push({ invalid: currentPath, valid: paths[key] });
            continue;
        }
        // Bad ReliabilityHandleComponent path fix
        if (checkAndReplacePathSubstring(paths, key, { reMatch: reBadIncPath, replace: consts.REPLACEMENT_NAME_INC_TO_DEVELOPEMENT }, { reMatch: reBadReliabilityPath, replace: consts.REPLACEMENT_NAME_RELIABILITY_TO_RELIABLE })) {
            invalidStringsObject.fixable.push({ invalid: currentPath, valid: paths[key] });
            continue;
        }
        invalidStringsObject.unfixable++;
        console.error(`Couldn't fix ${outPaths[key]} from compile commands.\n`);
    }
    return invalidStringsObject;
}
/**
 *  *
 * @param outPaths
 * @param key of outPaths that we're trying to replace, using 'any'. shame...
 * @param fromTos reMatch: Regex for matching and replacement of the match, replace: string that replaces the match
 *
 * @returns true if outPaths modified
 */
function checkAndReplacePathSubstring(outPaths, key, ...fromTos) {
    const paths = outPaths;
    let currentPath = paths[key];
    for (const fromTo of fromTos) {
        currentPath = currentPath.replace(fromTo.reMatch, fromTo.replace);
    }
    if (!fs_1.existsSync(currentPath)) {
        return false;
    }
    else {
        paths[key] = currentPath;
        return true;
    }
}
//# sourceMappingURL=invalidPaths.js.map