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
            console.error(`Extensions cppStandard setting was set to ${extensionCppStandard}. Will not fix.`);
        }
        else{
            console.log(`Extension's cppStandard setting was set to empty string. Doing nothing.`);
        }
        return;
    }

    const workSpacesCppStandard: Record<string, CCppConfigurationJson> | undefined = getworkspacesCppStandard(project);

    if (!workSpacesCppStandard) {
        console.error("The cppStandard won't be changed.");
        return;
    }

    for (const key in workSpacesCppStandard){
        const workspaceCppStandard = workSpacesCppStandard[key];

        workspaceCppStandard.cppStandard = extensionCppStandard;
        console.log(`The ${key} workspace c_cpp_properties.json's cppStandard is set to ${extensionCppStandard}`);
    }
}


/**
 * @param project 
 * @logs error
 */
function getworkspacesCppStandard(project: ProjectUE4): Record<string, CCppConfigurationJson> | undefined {
    const mainCCppPropertiesConfiguration = project.getFirstCCppPropertiesConfiguration(project.mainWorkspaceKey);
    if (!mainCCppPropertiesConfiguration) {
        console.error("Couldn't get Main c_cpp_properties.json's first configuration.");
        return;
    }

    const ue4CCppPropertiesConfiguration = project.getFirstCCppPropertiesConfiguration(project.ue4WorkspaceKey);
    if (!ue4CCppPropertiesConfiguration) {
        console.error("Couldn't get UE4 c_cpp_properties.json's first configuration.");
        return;
    }

    const workspacesCppStandard: Record<string, CCppConfigurationJson> = {};
    workspacesCppStandard[project.mainWorkspaceKey] = mainCCppPropertiesConfiguration;
    workspacesCppStandard[project.ue4WorkspaceKey] = ue4CCppPropertiesConfiguration;

    return workspacesCppStandard;
}
