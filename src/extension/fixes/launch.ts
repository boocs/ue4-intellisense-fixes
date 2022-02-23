

/**
 * Fixes deprecated externalConsole setting in launch.json
 */

import * as vscode from "vscode";
import * as path from "path";

import * as consts from "../../consts";
import type { ProjectUE4 } from '../../project/projectUE4';
import { LaunchJson } from '../../project/ntypes';
import { jsonParseSafe, readStringFromFileSync, writeJsonToFileSync } from '../../shared';

import * as console from "../../console";


const CONSOLE_SETTING = "newExternalWindow";


export function fixLaunchFile(project: ProjectUE4) {
    console.log("Fixing launch.json.");

    const launchJsonReturn = getLaunchFile(project.mainWorkspaceFolder);

    if (!launchJsonReturn.launchJson) {
        console.error("Launch Json was undefined. Unable to fix.");
        return;
    }

    if (fixDeprecatedExternalConsole(launchJsonReturn.launchJson) || launchJsonReturn.isDirty){
        saveLaunchFile(project.mainWorkspaceFolder, launchJsonReturn.launchJson);
    }
    else {
        console.log("launch.json didn't need to be changed.");
    }

    return;
}


function fixDeprecatedExternalConsole(launchJson: LaunchJson): boolean {

    const configurations = launchJson.configurations;
    let isDirty = false;

    if (!configurations){
        console.error("No launch configurations to fix!");
        return isDirty;
    }
    
    for( const launchOject of configurations) {
        if(launchOject.externalConsole) {
            isDirty = true;

            launchOject.externalConsole = undefined;
            launchOject.console = CONSOLE_SETTING;
        }
    }

    return isDirty;
}


function getLaunchFile(workspaceFolder: vscode.WorkspaceFolder): { launchJson:LaunchJson | undefined, isDirty:boolean} {
    const workspacePath = workspaceFolder.uri.fsPath;

    const launchPath = path.join(workspacePath, consts.LAUNCH_PATH_SUFFIX);

    const launchFile: string | undefined = readStringFromFileSync(launchPath);

    if(!launchFile){
        return {launchJson:undefined, isDirty:false};
    }

    let launchJson = jsonParseSafe(launchFile) as LaunchJson;

    if(!launchJson){
        return repairAndGetLaunchFile(launchFile);
    }

    return {launchJson:launchJson, isDirty:false};
}

function saveLaunchFile(workspaceFolder: vscode.WorkspaceFolder, launchJson: LaunchJson) {

    const workspacePath = workspaceFolder.uri.fsPath;
    const launchPath = path.join(workspacePath, consts.LAUNCH_PATH_SUFFIX);

    console.log(`Writing ${launchPath} to file.`);
    writeJsonToFileSync(launchPath, launchJson);
}

function repairAndGetLaunchFile(launchFileStr: string) : { launchJson:LaunchJson | undefined, isDirty:boolean} {

    console.log("\nAttempting to fix the json of launch.json...");

    const fixedLaunchFileStr = launchFileStr.replaceAll(consts.RE_LAUNCH_SOURCE_FILE_MAP, `D:\\\\build\\\\++UE5\\\\Sync`);

    const  launchJson = jsonParseSafe(fixedLaunchFileStr) as LaunchJson;


    if(!!fixedLaunchFileStr && fixedLaunchFileStr !== launchFileStr && !!launchJson){
        return { launchJson:launchJson, isDirty:true};
    }
    else{
        return { launchJson:launchJson, isDirty:false};
    }

}
