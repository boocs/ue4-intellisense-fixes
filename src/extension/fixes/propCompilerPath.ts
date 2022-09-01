// Using this extensions compiler path setting will force a compiler path in c_cpp_properties.json

import * as vscode from "vscode";

import { ProjectUE4} from "../../project/projectUE4";
import * as consts from "../../consts";
import { isMacM1 } from "../../shared";

import * as console from "../../console";

export async function fixPropCompilerPath(project: ProjectUE4) {
    
    console.log("Fixing compiler path in c_cpp_properties.json.");

    const config = vscode.workspace.getConfiguration(consts.CONFIG_SECTION_EXTENSION_COMPILER);

    const currentExtCompilerPath = config.get<string>(consts.CONFIG_SETTINGS_PATH);
    const currentExtStrictSetting = config.get<boolean>(consts.CONFIG_SETTING_STRICT_PATH);

    const compileCommandsCompilerPath = getCompileCommandsCompilerPath(project);

    if(!compileCommandsCompilerPath) {
        return;
    }

    const hasValidatedCurrentExtCompilerPath = !currentExtCompilerPath || currentExtCompilerPath !== compileCommandsCompilerPath

    if(hasValidatedCurrentExtCompilerPath && !currentExtStrictSetting) {
        console.log(`Auto updating extension's compiler setting to ${compileCommandsCompilerPath}`)
        try {
            await config.update(consts.CONFIG_SETTINGS_PATH, compileCommandsCompilerPath, true);
        } catch (error) {
            console.error("Couldn't update extension's compiler setting!");
            return;
        }
        
    }
    
    // Set this any way because it won't save if nothing has changed
    setCCppPropCompilerPathToExtPath(project, compileCommandsCompilerPath);
    
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


function getCompileCommandsCompilerPath(project: ProjectUE4) {
    const compileCommandsConfigFirstIndex = project.getCompileCommandsAtConfigIndex(project.mainWorkspaceKey, 0);

    const firstCommandOfFirstIndex = compileCommandsConfigFirstIndex?.compileCommands[0].command;

    if(!firstCommandOfFirstIndex){
        console.error("Couldn't get command from Compile Commands!");
        return null;
    }

    return getCompilerPathFromString(firstCommandOfFirstIndex);

}

function getCompilerPathFromString(firstCommandOfFirstIndex: string) {
    const match = firstCommandOfFirstIndex.match(consts.RE_COMPILE_COMMAND_COMPILER_EXE_AND_RSP_PATH);

    if(match?.length !== 3 || !match[2].startsWith("@")) {
        console.log("Error with matching compiler path and response file path.");
        return null;
    }


    return match[0].replaceAll(`"`, "");
}

