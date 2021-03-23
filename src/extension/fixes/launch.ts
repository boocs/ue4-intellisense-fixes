

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

    const launchJson: LaunchJson | undefined = getLaunchFile(project.mainWorkspaceFolder);

    if (!launchJson) {
        console.error("Launch Json was undefined. Unable to fix.");
        return;
    }

    if (fixDeprecatedExternalConsole(launchJson)){
        saveLaunchFile(project.mainWorkspaceFolder, launchJson);
    }
    else {
        console.log("launch.json didn't need to be changed.");
    }

    return;
}


function fixDeprecatedExternalConsole(launchJson: LaunchJson) {

    const configurations = launchJson.configurations;
    let isDirty = false;

    if (!configurations){
        console.error("No launch configurations to fix!");
        return;
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


function getLaunchFile(workspaceFolder: vscode.WorkspaceFolder): LaunchJson | undefined{
    const workspacePath = workspaceFolder.uri.fsPath;

    const launchPath = path.join(workspacePath, consts.LAUNCH_PATH_SUFFIX);

    const launchFile: string | undefined = readStringFromFileSync(launchPath);

    if(!launchFile){
        return undefined;
    }

    return jsonParseSafe(launchFile) as LaunchJson;
}

function saveLaunchFile(workspaceFolder: vscode.WorkspaceFolder, launchJson: LaunchJson) {

    const workspacePath = workspaceFolder.uri.fsPath;
    const launchPath = path.join(workspacePath, consts.LAUNCH_PATH_SUFFIX);

    console.log(`Writing ${launchPath} to file.`);
    writeJsonToFileSync(launchPath, launchJson);
}
