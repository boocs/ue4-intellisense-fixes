"use strict";
/**
 * Adds backup Intellisense to main and UE4 workspaces
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixBackup = void 0;
const vscode = require("vscode");
const path = require("path");
const shared = require("../../shared");
const consts = require("../../consts");
const text = require("../../text");
const console = require("../../console");
async function fixBackup(outMainCCppProperties, outUE4CCppProperties, mainCompileCommands, extensionSettings) {
    var _a, _b, _c, _d;
    console.log("Attempting to fix Backup Intellisense.");
    const mainConfig = (_a = outMainCCppProperties.configurations) === null || _a === void 0 ? void 0 : _a[0];
    const ue4Config = (_b = outUE4CCppProperties.configurations) === null || _b === void 0 ? void 0 : _b[0];
    if (!mainConfig || !ue4Config) {
        console.error(`Error, bad config(s) for fixBackup(): Main = ${(_c = outMainCCppProperties === null || outMainCCppProperties === void 0 ? void 0 : outMainCCppProperties.configurations) === null || _c === void 0 ? void 0 : _c.length}. UE4 = ${(_d = outUE4CCppProperties === null || outUE4CCppProperties === void 0 ? void 0 : outUE4CCppProperties.configurations) === null || _d === void 0 ? void 0 : _d.length}`);
        return;
    }
    const mainWorkspace = await shared.getUE4ProjectsMainWorkspace();
    if (!mainWorkspace) {
        return;
    }
    const reStringParseForcedIncludes = extensionSettings.get(consts.CONFIG_SETTING_426_FORCED_REGEX, consts.RE_COMPILE_COMMAND_FORCED_PATHS);
    const forcedPaths = await getForcedPaths(mainCompileCommands, reStringParseForcedIncludes);
    if (!forcedPaths) {
        await vscode.window.showInformationMessage(text.MESSAGE_BUILD_SUCCESSFUL_PROJECT, text.OK);
        return;
    }
    // generated.h and gen.cpp files path
    const mainGeneratedPath = await getMainWorkspaceGeneratedPath();
    if (!mainGeneratedPath) {
        vscode.window.showInformationMessage(text.MESSAGE_BUILD_SUCCESSFUL_PROJECT, text.OK);
        return;
    }
    // cc = compile commands
    let ccAllPaths = undefined;
    let ccUE4Paths = undefined;
    // Parse includes from compile commands
    const isGeneralIncludesEnabled = false; //extensionSettings.get<boolean>(consts.CONFIG_SETTING_426_ENABLE_GENERIC_INC, false);
    if (!isGeneralIncludesEnabled) {
        const reStringParseIncludePaths = extensionSettings.get(consts.CONFIG_SETTING_426_INCLUDES_REGEX, consts.RE_COMPILE_COMMAND_INCLUDE_PATHS);
        const regExpAllIncludes = shared.getRegExp(reStringParseIncludePaths);
        ccAllPaths = mainCompileCommands.getUniqueMatchesFromAllCommandLines(regExpAllIncludes);
    }
    // Check for paths and that we have no invalid paths
    if ((ccAllPaths === null || ccAllPaths === void 0 ? void 0 : ccAllPaths.length) && !mainCompileCommands.hasInvalidPaths) {
        const ue4DirSubstring = extensionSettings.get(consts.CONFIG_SETTING_426_PATH_SUBSTRING, consts.UE4_426_DIR_FOLDER_NAME);
        ccUE4Paths = ccAllPaths.filter(path => {
            return path.includes(ue4DirSubstring);
        });
    }
    else {
        ccAllPaths = undefined; // We'll use general paths
        console.log("Compile Command paths are undefined or some couldn't be fixed. This also could be because the general paths setting is enabled.\n");
    }
    // Main
    fixIncludePath(mainConfig, (ccAllPaths === null || ccAllPaths === void 0 ? void 0 : ccAllPaths.length) ? ccAllPaths : await getDefaultMainIncludePaths(mainWorkspace, mainGeneratedPath));
    fixBrowsePath(mainConfig, (ccAllPaths === null || ccAllPaths === void 0 ? void 0 : ccAllPaths.length) ? ccAllPaths : getDefaultMainBrowsePaths(mainGeneratedPath));
    // UE4
    fixIncludePath(ue4Config, (ccUE4Paths === null || ccUE4Paths === void 0 ? void 0 : ccUE4Paths.length) ? ccUE4Paths : getDefaultUE4IncludePaths());
    fixBrowsePath(ue4Config, undefined); // We use undefined for an empty array for optimal tag parser configuration
    fixForcedInclude(forcedPaths);
    console.log("End Backup Intellisense.\n");
}
exports.fixBackup = fixBackup;
function fixIncludePath(outCCppConfig, includePaths) {
    // We don't do any checking, we always save to array and let the write method of the c_cpp_properties check if file needs updating
    console.log("Fixing include path.");
    outCCppConfig.includePath = [consts.VSCODE_SPECIAL_VAR_DEFAULT].concat(includePaths);
}
/**
 *
 * @param outCCppConfig
 * @param browsePaths use undefined for empty array without special default variable
 */
function fixBrowsePath(outCCppConfig, browsePaths) {
    if (!browsePaths) {
        outCCppConfig.browse = {};
        outCCppConfig.browse.path = [];
        return;
    }
    console.log("Fixing browse path.");
    if (!outCCppConfig.browse) {
        outCCppConfig.browse = {};
    }
    outCCppConfig.browse.path = [consts.VSCODE_SPECIAL_VAR_DEFAULT].concat(browsePaths);
}
function fixForcedInclude(forcedPaths) {
    // We set in project's workspace file so it'll applies to both workspaces
    console.log("Fixing forced include.");
    const settings = vscode.workspace.getConfiguration(consts.CONFIG_SECTION_C_CPP);
    if (!settings) {
        console.error("Error getting settings for fixForcedInclude");
        return;
    }
    settings.update(consts.CONFIG_SETTING_DEFAULT_FORCED_INCLUDE, forcedPaths);
}
/**
 * Get the path to the definitions file needed for forcedInclude setting
 */
async function getForcedPaths(mainCompileCommands, reForcedPathsString) {
    const regExpAllForced = shared.getRegExp(reForcedPathsString);
    return mainCompileCommands.getUniqueMatchesFromAllCommandLines(regExpAllForced);
}
async function getDefaultMainIncludePaths(mainWorkspace, mainGeneratedPath) {
    const publicPrivatePaths = [];
    // Find and add public and private folders if they exist
    for await (const glob of [consts.GLOB_ANY_IN_PRIVATE_FOLDER, consts.GLOB_ANY_IN_PUBLIC_FOLDER]) {
        const relPath = new vscode.RelativePattern(mainWorkspace, glob);
        const files = await vscode.workspace.findFiles(relPath, undefined, 1);
        if (!files.length) {
            console.log(`Didn't find a ${glob} directory in ${mainWorkspace.name}. Won't be added to includes.`);
            continue;
        }
        publicPrivatePaths.push(path.parse(files[0].fsPath).dir);
    }
    return consts.CONFIG_VALUES_GENERIC_MAIN_INCLUDE_PATHS.concat(publicPrivatePaths, getGeneralUE4SourcePaths(true), mainGeneratedPath);
}
function getDefaultMainBrowsePaths(mainGeneratedPath) {
    const ue4SourcePaths = getGeneralUE4SourcePaths();
    return consts.CONFIG_VALUES_GENERIC_MAIN_BROWSE_PATHS.concat(mainGeneratedPath, ue4SourcePaths);
}
function getDefaultUE4IncludePaths() {
    return consts.CONFIG_VALUES_GENERIC_UE4_INCLUDE_PATHS;
}
/**
 * @param useRecursive Adds ** folder to every path (used for recursive search indicator)
 */
function getGeneralUE4SourcePaths(useRecursive = false) {
    const ue4Path = shared.getUE4Path();
    if (!ue4Path) {
        console.error("getUE4Paths(): No UE4 path found!");
        return [];
    }
    const recursiveSearchPattern = useRecursive ? consts.INCLUDE_PATH_RECURSIVE_SEARCH_SUFFIX : "";
    const paths = [];
    for (const partialPath of [consts.PARTIAL_INCLUDE_PATH_UE4_INTERMEDIATE, consts.PARTIAL_INCLUDE_PATH_UE4_SOURCE]) {
        const fullPath = path.join(ue4Path, partialPath, recursiveSearchPattern);
        paths.push(fullPath);
    }
    return paths;
}
/**
 * Get main workspaces path with the generated.h and gen.cpp files
 */
async function getMainWorkspaceGeneratedPath() {
    const mainWorkspace = await shared.getUE4ProjectsMainWorkspace();
    if (!mainWorkspace) {
        return;
    }
    const relPath = new vscode.RelativePattern(mainWorkspace, consts.GLOB_GENERATED_FILES);
    const files = await vscode.workspace.findFiles(relPath, undefined, 1);
    if (!files.length) {
        await vscode.window.showInformationMessage(text.MESSAGE_BUILD_SUCCESSFUL_PROJECT, text.OK);
        return "";
    }
    return path.parse(files[0].fsPath).dir;
}
//# sourceMappingURL=backupIntell.js.map