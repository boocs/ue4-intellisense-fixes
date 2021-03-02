"use strict";
/**
 * This fix optimizes the UE4 workspace by removing any project specific references and adding basic Intellisense
 *
 * To add preincludes, without polluting the UE4 workspace, we need to set them in the '.code-workspace' file.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixUE4Optimization = void 0;
const projectUE4_1 = require("../../project/projectUE4");
const consts = require("../../consts");
const shared_1 = require("../../shared");
const console = require("../../console");
function fixUE4Optimization(project) {
    console.log("Attempting to fix UE4 workspace optimization.");
    const ue4CCppPropertiesFirstConfig = project.getFirstCCppPropertiesConfiguration(project.ue4WorkspaceKey);
    if (!ue4CCppPropertiesFirstConfig) {
        console.error("Couldn't get UE4's first c_cpp_properties.json config.");
        return;
    }
    renameUE4InConfig(ue4CCppPropertiesFirstConfig, projectUE4_1.ProjectUE4.ue4Version);
    removeCompileCommandsFromConfig(ue4CCppPropertiesFirstConfig);
    addBasicUE4IntellisenseToConfig(ue4CCppPropertiesFirstConfig);
    addResponsePreIncludesToMainWorkspaceConfig(project);
    return;
}
exports.fixUE4Optimization = fixUE4Optimization;
function renameUE4InConfig(outConfig, ue4Version) {
    outConfig.name = `Unreal Engine ${ue4Version} Source`;
}
function removeCompileCommandsFromConfig(outConfig) {
    outConfig.compileCommands = undefined;
}
function addBasicUE4IntellisenseToConfig(outConfig) {
    outConfig.includePath = [consts.VSCODE_SPECIAL_VAR_DEFAULT].concat(consts.CONFIG_VALUES_GENERIC_UE4_INCLUDE_PATHS);
}
function addResponsePreIncludesToMainWorkspaceConfig(project) {
    const preincludeMatches = findPreincludeMatches(project);
    if (!preincludeMatches) {
        console.error("Couldn't find preinclude matches in response file.");
        return;
    }
    const extractedForcedIncludePaths = [consts.VSCODE_SPECIAL_VAR_DEFAULT].concat(preincludeMatches);
    const mainSettings = project.getCCppSettingsConfig(project.mainWorkspaceKey);
    if (!mainSettings) {
        console.error("Couldn't get main settings. Can't change forced includes.");
        return;
    }
    const currentForcedIncludes = mainSettings.get(consts.CONFIG_SETTING_DEFAULT_FORCED_INCLUDE);
    checkAndUpdateForcedIncludes(mainSettings, currentForcedIncludes, extractedForcedIncludePaths);
}
function findPreincludeMatches(project) {
    const mainCompileCommands = project.getMainFirstConfigCompileCommands();
    const responsePaths = mainCompileCommands === null || mainCompileCommands === void 0 ? void 0 : mainCompileCommands.getAllUsedResponsePaths();
    if (!responsePaths || responsePaths.length > 1) {
        console.error(`Response paths length was ${responsePaths === null || responsePaths === void 0 ? void 0 : responsePaths.length}. Can't add preincludes.`);
        return;
    }
    const responseFileString = shared_1.readStringFromFileSync(responsePaths[0]);
    const re = shared_1.createRegExpFrom(consts.RE_COMPILE_COMMAND_FORCED_PATHS);
    return responseFileString === null || responseFileString === void 0 ? void 0 : responseFileString.match(re);
}
function checkAndUpdateForcedIncludes(mainSettings, currentForcedIncludes, extractedForcedIncludePaths) {
    if (!currentForcedIncludes) {
        console.log("Updating main workspace file's forced includes.");
        mainSettings.update(consts.CONFIG_SETTING_DEFAULT_FORCED_INCLUDE, extractedForcedIncludePaths, false);
        return;
    }
    else {
        if (extractedForcedIncludePaths.every(value => {
            return currentForcedIncludes.includes(value);
        })) {
            console.log("Current Main workspace file's forced includes are already fixed.");
            return;
        }
        else {
            console.log("Overwriting main workspace file's forced includes.");
            mainSettings.update(consts.CONFIG_SETTING_DEFAULT_FORCED_INCLUDE, extractedForcedIncludePaths, false);
            return;
        }
    }
}
//# sourceMappingURL=optimizeUE4.js.map