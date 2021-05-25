/**
 * This fix optimizes the UE4 workspace by removing any project specific references and adding basic Intellisense
 * 
 * To add preincludes, without polluting the UE4 workspace, we need to set them in the '.code-workspace' file.
 */


import type {WorkspaceConfiguration} from "vscode";

import { ProjectUE4 } from "../../project/projectUE4";
import type { CCppConfigurationJson } from "../../project/ntypes";
import * as consts from "../../consts";
import { readStringFromFileSync } from "../../shared";

import * as console from "../../console";


export function fixUE4Optimization(project: ProjectUE4) {
    console.log("Attempting to fix UE4 workspace optimization.");

    const ue4CCppPropertiesFirstConfig = project.getFirstCCppPropertiesConfiguration(project.ue4WorkspaceKey);
    const allUE4CppPropertiesConfigs = project.getCCppConfigurationsFromWorkspace(project.ue4WorkspaceKey);

    if (!ue4CCppPropertiesFirstConfig || !allUE4CppPropertiesConfigs) {
        console.error("Couldn't get UE4's c_cpp_properties.json configs.");
        return;
    }

    renameUE4InConfig(ue4CCppPropertiesFirstConfig, ProjectUE4.ue4Version);

    removeCompileCommandsFromConfig(allUE4CppPropertiesConfigs);

    addBasicUE4IntellisenseToConfig(allUE4CppPropertiesConfigs);

    addResponsePreIncludesToMainWorkspaceConfig(project);

    return;
}


function renameUE4InConfig(outConfig: CCppConfigurationJson, ue4Version: string) {

    outConfig.name = `Unreal Engine ${ue4Version} Source`;
}


function removeCompileCommandsFromConfig(outConfigs: CCppConfigurationJson[]) {
    for (const config of outConfigs) {
        config.compileCommands = undefined;
    }
    
}


function addBasicUE4IntellisenseToConfig(outConfigs: CCppConfigurationJson[]) {
    for (const config of outConfigs) {
        config.includePath = [consts.VSCODE_SPECIAL_VAR_DEFAULT].concat(consts.CONFIG_VALUES_GENERIC_UE4_INCLUDE_PATHS);
    }
    
}


function addResponsePreIncludesToMainWorkspaceConfig(project: ProjectUE4) {

    const preincludeMatches = findPreincludeMatches(project);

    if (!preincludeMatches?.length) {
        console.error("Couldn't find preinclude matches in response file.");
        return;
    }

    const extractedForcedIncludePaths = [consts.VSCODE_SPECIAL_VAR_DEFAULT].concat(preincludeMatches);

    const mainSettings: WorkspaceConfiguration | undefined = project.getCCppSettingsConfig(project.mainWorkspaceKey);

    if (!mainSettings) {
        console.error("Couldn't get main settings. Can't change forced includes.");
        return;
    }

    const currentForcedIncludes: string[] | undefined = mainSettings.get(consts.CONFIG_SETTING_DEFAULT_FORCED_INCLUDE);

    checkAndUpdateForcedIncludes(mainSettings, currentForcedIncludes, extractedForcedIncludePaths);
}


function findPreincludeMatches(project: ProjectUE4): RegExpMatchArray | undefined | null {
    const mainCompileCommands = project.getMainFirstConfigCompileCommands();

    const responsePaths = mainCompileCommands?.getAllUsedResponsePaths();

    if (!responsePaths) {
        console.error(`Response paths was ${responsePaths}. Can't add preincludes.`);
        return;
    }

    let matches : RegExpMatchArray | undefined | null = undefined;

    for (const responsePath of responsePaths){
        const responseFileString = readStringFromFileSync(responsePath);
        
        if(!responseFileString){
            continue;
        }
        
        const match = responseFileString.match(consts.RE_COMPILE_COMMAND_FORCED_PATHS);
        if(!match?.length){
            continue;  // TODO warning message here???
        }

        if(!matches){ 
            matches = match;
        }
        else{
            matches = matches.concat(match);
        }
    }

    return matches;
    
}


function checkAndUpdateForcedIncludes( mainSettings: WorkspaceConfiguration, currentForcedIncludes: string[] | undefined, extractedForcedIncludePaths: string[]){
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
