"use strict";
/**
 * Fixes invalid paths in the compile command's file
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixInvalidPaths = void 0;
const fs_1 = require("fs");
const consts = require("../../consts");
const compileCommands_1 = require("../../compileCommands");
const shared = require("../../shared");
function fixInvalidPaths(compileCommands, extensionSettings) {
    console.log("Attempting to fix Invalid Paths");
    const reStringParseIncludePaths = extensionSettings.get(consts.CONFIG_SETTING_426_INCLUDES_REGEX, consts.RE_COMPILE_COMMAND_INCLUDE_PATHS);
    const regExpAllIncludes = shared.getRegExp(reStringParseIncludePaths);
    let fixedCount = 0;
    let totalCommandObjects = 0;
    let unfixCount = 0;
    for (const commandObject of compileCommands) {
        totalCommandObjects++;
        const matches = compileCommands_1.CompileCommands.getMatchFromCommandLine(regExpAllIncludes, commandObject);
        if (!matches) {
            continue;
        }
        const invalidPaths = getInvalidWithValidPaths(matches);
        if (!invalidPaths.fixable.length) {
            continue;
        }
        else {
            fixedCount += invalidPaths.fixable.length;
        }
        unfixCount += invalidPaths.unfixable;
        if (!commandObject.command) {
            continue;
        }
        for (const invalidPath of invalidPaths.fixable) {
            commandObject.command = commandObject.command.replace(invalidPath.invalid, invalidPath.valid);
        }
    }
    console.log(`\nCompile Command File Stats:\n   ${totalCommandObjects} command objects.\n   Average of ${fixedCount / totalCommandObjects} paths fixed per object.\n   ${unfixCount} number of unfixed paths.\n`);
}
exports.fixInvalidPaths = fixInvalidPaths;
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