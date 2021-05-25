import * as vscode from "vscode";

import type { CCppConfigurationJson } from "../../project/ntypes";
import type { ProjectUE4 } from "../../project/projectUE4";
import { CONFIG_SECTION_EXTENSION } from "../../consts";

import * as console from "../../console";


const EXTENSION_CPP_STANDARD_SETTING = "cppStandard";


export function fixWrongCppStandard(project: ProjectUE4) {
    console.log("Attempting to fix wrong cppStandard.");

    const extensionSettings = vscode.workspace.getConfiguration(CONFIG_SECTION_EXTENSION); // change to extension cppStandard
    const extensionCppStandard = extensionSettings?.get<string>(EXTENSION_CPP_STANDARD_SETTING);

    if(!extensionCppStandard){
        if(extensionCppStandard !== ''){
            console.error("Error getting cppStandard setting.\nUE4 will use cpptool's cppStandard setting instead of this extension's setting.");
        }
        else{
            console.log("Extension's cppStandard setting was set to empty string.\nIntellisense will use cpptools cppStandard setting instead of this extension's setting.");
        }
        return;
    }

    const workSpacesFirstCCppConfigs: Record<string, CCppConfigurationJson[]> | undefined = getWorkspacesCCppConfigs(project);
    if (!workSpacesFirstCCppConfigs) {
        console.error("Error getting workspaces. The cppStandard won't be changed.");
        return;
    }
    

    for (const key in workSpacesFirstCCppConfigs){
        for (const config of workSpacesFirstCCppConfigs[key]) {
            config.cppStandard = extensionCppStandard;
            console.log(`This extension set ${key} workspace c_cpp_properties.json's cppStandard to ${extensionCppStandard}`);
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
