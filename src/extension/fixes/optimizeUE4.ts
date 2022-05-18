/**
 * This fix optimizes the UE workspace by setting the intellisense to Tag Parser.
 * Tag parser Intellisense removes red squiggles but keeps navigation of the UE source.
 */


import * as vscode from "vscode"

import { ProjectUE4 } from "../../project/projectUE4";

import * as console from "../../console";


const SETTING_TAG_PARSER = "Tag Parser";
const SETTING_INTELLISENSE_ENGINE = "intelliSenseEngine";


export async function fixUEOptimization(project: ProjectUE4, isOptimizationEnabled: boolean) {
    console.log("Attempting to fix UE workspace optimization.");


    const configScope = project.ue4WorkspaceFolder;
    const cppConfig = vscode.workspace.getConfiguration("C_Cpp", configScope);

    // Tag Parser if enabled else remove the setting with undefined
    const value = isOptimizationEnabled? SETTING_TAG_PARSER: undefined;

    await updateSetting(cppConfig, SETTING_INTELLISENSE_ENGINE, value);

    if(isOptimizationEnabled){
        console.warning("Optimization of UE is enabled!")
        console.log("Enabling UE optimization disables red squiggle compiling for the Unreal Engine source code.");
        console.log("This does not affect your project's source code (it still can have red squiggles).");
        console.log("You can disable this optimization in this extension's settings.")
    }
    else {
        console.log("Optimization of UE is disabled.")
    }
    
    return;
}


async function updateSetting(cppConfig: vscode.WorkspaceConfiguration, setting: string, value: string | undefined) {

    const currentValue = cppConfig.inspect(setting)?.workspaceFolderValue;

    if(currentValue === value){
        return;
    }

    try {
        await cppConfig.update(SETTING_INTELLISENSE_ENGINE, value, null);
    } catch (error) {
        console.error(`Exception while updating ${SETTING_INTELLISENSE_ENGINE } setting with ${value}: UE Optimization`)
        return;
    }
}