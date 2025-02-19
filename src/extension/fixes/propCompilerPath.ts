// Using this extensions compiler path setting will force a compiler path in c_cpp_properties.json

import * as vscode from "vscode";

import { ProjectUE4} from "../../project/projectUE4";
import * as consts from "../../consts";


import * as console from "../../console";
import { getMainWorkspaceFolder } from "../../shared";

export async function fixPropCompilerPath(project: ProjectUE4) {
    
    console.log("Fixing compiler path in c_cpp_properties.json.");

    const mainWorkspaceFolder = getMainWorkspaceFolder();
    if(!mainWorkspaceFolder){
        return;
    }
    const config = vscode.workspace.getConfiguration(consts.CONFIG_SECTION_EXTENSION_COMPILER, mainWorkspaceFolder);

    const currentExtCompilerPath = config.get<string>(consts.CONFIG_SETTINGS_PATH);
    
    
    if(!currentExtCompilerPath){
        console.error("Extension's compiler path setting wasn't set!");
        return;
    }
    
    // Set this any way because it won't save if nothing has changed
    setCCppPropCompilerPathToExtPath(project, currentExtCompilerPath);
    
    console.log("End fix c_cpp_properties compiler path.\n");
}


function setCCppPropCompilerPathToExtPath(project: ProjectUE4, currentExtCompilerPath: string) {
    const mainCppProp = project.getCCppConfigurationsFromWorkspace(project.mainWorkspaceKey);
    const ue4CppProp = project.getCCppConfigurationsFromWorkspace(project.ue4WorkspaceKey);

    const cppProps = [mainCppProp, ue4CppProp];

    for (const cppProp of cppProps) {

        if(!cppProp) { continue;}

        for( const propConfig of cppProp) {
            propConfig.compilerPath = currentExtCompilerPath;            
        }        
    }

}


