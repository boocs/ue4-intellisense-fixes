// Sets cppStandard if overridden in extension's settings
// Shows how everything is set
// Warns if no cppStandard is set
// Warns about UE4/UE5 default cppStandard


import * as vscode from "vscode";

import type { CCppConfigurationJson } from "../../project/ntypes";
import type { ProjectUE4 } from "../../project/projectUE4";
import { CONFIG_SECTION_EXTENSION } from "../../consts";

import * as console from "../../console";
import { getMainWorkspaceFolder } from "../../shared";


const EXTENSION_CPP_STANDARD_SETTING = "cppStandard";
const VSC_CCPP_STANDARD_SETTING = `default.${EXTENSION_CPP_STANDARD_SETTING}`;
const DEFAULT_UE5_CPP_STANDARD = "c++17";
const DEFAULT_UE5_3_CPP_STANDARD = "c++20";


export function fixWrongCppStandard(project: ProjectUE4, ueVersion: { major: number; minor: number; patch: number; }) {
    console.log("Attempting to fix wrong cppStandard.");

    console.log("Info : Unreal 4 should be default c++14 (it can be c++17 with some special configuration)");
    console.log("Info : Unreal 5 should be c++17");
    console.log("Info : Unreal 5.3+ should be c++20");

    const mainWorkspaceFolder = getMainWorkspaceFolder();
    if(!mainWorkspaceFolder){
        return;
    }
    const extensionSettings = vscode.workspace.getConfiguration(CONFIG_SECTION_EXTENSION, mainWorkspaceFolder); // change to extension cppStandard
    const extensionCppStandard = extensionSettings?.get<string>(EXTENSION_CPP_STANDARD_SETTING);

    let isOverride = true;

    if (!extensionCppStandard) {
        if (extensionCppStandard !== '') {
            console.error("Error getting cppStandard setting.\nUE will use cpptool's cppStandard setting instead of this extension's setting.");
        }
        else {
            console.log("Extension's cppStandard setting was set to empty string.\nIntellisense will use cpptools cppStandard setting instead of this extension's setting.");
        }
        isOverride = false;
    }

    const ue5_cpp_standard = getUE5CppStandard(ueVersion);
    
    let isWarnedAboutUE5 = false;
    if (ue5_cpp_standard && extensionCppStandard && extensionCppStandard !== ue5_cpp_standard) {
        console.error(`UE5 should be ${ue5_cpp_standard} but you have a different cppStandard forced in this extension's settings!`);
        isWarnedAboutUE5 = true;
    }

    const workSpacesCCppConfigs: Record<string, CCppConfigurationJson[]> | undefined = getWorkspacesCCppConfigs(project);
    if (!workSpacesCCppConfigs) {
        console.error("Error getting workspaces. The cppStandard won't be changed.");
        return;
    }

    // TODO this code is very unreadable...
    for (const key in workSpacesCCppConfigs) {
        const workspaceVscodeConfig = project.getCCppSettingsConfig(key);
        let currentVSCodeCppStandard: string | undefined | null = "";

        if (workspaceVscodeConfig) {
            currentVSCodeCppStandard = workspaceVscodeConfig.get(VSC_CCPP_STANDARD_SETTING);
            if (currentVSCodeCppStandard || currentVSCodeCppStandard === '') {
                console.log(`Current VSCode/cpptools cppStandard is: ${currentVSCodeCppStandard} (Can be blank)`);
            }

        }

        for (const config of workSpacesCCppConfigs[key]) {
            if (!config.cppStandard && !currentVSCodeCppStandard && !extensionCppStandard) {
                console.error("No cppStandard is set. Please force a standard in this extension's settings.");
            }

            if (!isWarnedAboutUE5 && ue5_cpp_standard && config.cppStandard && config.cppStandard !== ''
                && config.cppStandard !== ue5_cpp_standard) {
                console.error(`UE5 should be ${ue5_cpp_standard} but you have a different cppStandard in ${key} c_cpp_properties.json`);
                isWarnedAboutUE5 = true;
        }

            console.log(`Current c_cpp_properties.json's cppStandard is: ${config.cppStandard} (Overrides VSCode/cpptools if not undefined)`);
            if (isOverride && extensionCppStandard !== config.cppStandard) {
                config.cppStandard = extensionCppStandard;
                console.log(`This extension set ${key} workspace c_cpp_properties.json's cppStandard to ${extensionCppStandard}`);
            }
            else if (isOverride && extensionCppStandard === config.cppStandard) {
                console.log(`${key} workspace c_cpp_properties.json's cppStandard is already set.`);
            }
        }

        if (!isWarnedAboutUE5 && ue5_cpp_standard && currentVSCodeCppStandard && currentVSCodeCppStandard !== ''
                && currentVSCodeCppStandard !== ue5_cpp_standard) {
                console.error(`UE5 should be ${ue5_cpp_standard} but you have a different cppStandard in ${key} VSCode configs`);
                console.error("You should force a cppStandard in this extension's settings.");
                isWarnedAboutUE5 = true;
        }

    }

    // NOTE: These configs automatically get checked for saving when extension is done. Don't need to save them  here.
}


/**
 * @param project 
 * @logs error
 */
function getWorkspacesCCppConfigs(project: ProjectUE4): Record<string, CCppConfigurationJson[]> | undefined {
    const mainCCppPropertiesConfiguration = project.getCCppConfigurationsFromWorkspace(project.mainWorkspaceKey);
    if (!mainCCppPropertiesConfiguration) {
        console.error("Couldn't get Main c_cpp_properties.json's first configuration.");
        return;
    }

    const ue4CCppPropertiesConfiguration = project.getCCppConfigurationsFromWorkspace(project.ue4WorkspaceKey);
    if (!ue4CCppPropertiesConfiguration) {
        console.error("Couldn't get UE4 c_cpp_properties.json's first configuration.");
        return;
    }

    const workspaces: Record<string, CCppConfigurationJson[]> = {};
    workspaces[project.mainWorkspaceKey] = mainCCppPropertiesConfiguration;
    workspaces[project.ue4WorkspaceKey] = ue4CCppPropertiesConfiguration;

    return workspaces;
}

// For UE5 only
function getUE5CppStandard(ueVersion: { major: number; minor: number; patch: number; }): string {
    
    const isUE5_0_thru_5_2 = ueVersion.major === 5 && ueVersion.minor < 3;
    const isUE5_3_plus = ueVersion.major === 5 && ueVersion.minor >= 3;

    if(isUE5_0_thru_5_2 === true){
        return DEFAULT_UE5_CPP_STANDARD;
    }
    else if(isUE5_3_plus === true){
        return DEFAULT_UE5_3_CPP_STANDARD;
    }

    return "";
}