// Using this extensions compiler path setting will force a compiler path in c_cpp_properties.json

import * as vscode from "vscode";

import { ProjectUE4} from "../../project/projectUE4";
import * as consts from "../../consts";
import { isMacM1 } from "../../shared";

import * as console from "../../console";

export function fixPropCompilerPath(project: ProjectUE4) {
    
    console.log("Fixing compiler path in c_cpp_properties.json.");

    const config = vscode.workspace.getConfiguration(consts.CONFIG_SECTION_EXTENSION_COMPILER);
    let currentExtCompilerPath = config.get<string>(consts.CONFIG_SETTINGS_PATH);

    if(!currentExtCompilerPath) {

        if (isMacM1()){
            console.log("Extension compiler path isn't set. Mac M1 compiler path will be auto set.");
            config.update(consts.CONFIG_SETTINGS_PATH, consts.MACM1_DEFAULT_COMPILER_PATH, true);
            currentExtCompilerPath = consts.MACM1_DEFAULT_COMPILER_PATH;
        }
        else{
            console.log("Extension compiler path isn't set. Will not force compiler path in c_cpp_properties. (Not an error)");
            console.log("If the extension's compiler path setting was previously set you should reset your UE project to get back the c_cpp_properties default path.\n");
            return;
        }
        
    }

    console.log(`Extension compiler path is set to: ${currentExtCompilerPath}`);

    const mainCppProp = project.getCCppConfigurationsFromWorkspace(project.mainWorkspaceKey);
    const ue4CppProp = project.getCCppConfigurationsFromWorkspace(project.ue4WorkspaceKey);

    const cppProps = [mainCppProp, ue4CppProp];

    for (const cppProp of cppProps) {

        if(!cppProp) { continue;}

        for( const propConfig of cppProp) {
            propConfig.compilerPath = currentExtCompilerPath;            
        }        
    }

    console.log("End fix c_cpp_properties compiler path.\n");
}
