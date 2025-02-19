/**
 * Fixes malformed launch.json and deprecated externalConsole setting in launch.json
 * 
 * Note: This can't use the vscode api because update doesn't work on malformed json
 */

import * as pathLib from "path";

import * as consts from "../../consts";
import type { ProjectUE4 } from '../../project/projectUE4';
import { LaunchJson, LaunchObjectJson} from '../../project/ntypes';
import { jsonParseSafe, readStringFromFile, writeJsonOrStringToFile } from '../../shared';

import * as console from "../../console";


// eslint-disable-next-line @typescript-eslint/naming-convention
type hasFixed = boolean;

const REPLACEMENT_CONSOLE_SETTING = "externalTerminal";
const OLD_REPLACEMENT_CONSOLE_SETTING = "newExternalWindow";

export async function fixLaunchFile(project: ProjectUE4) {
    console.log("Fixing launch.json.");

    const launchFilePath = pathLib.join(project.mainWorkspaceFolder.uri.fsPath, consts.LAUNCH_PATH_SUFFIX);
    const launchFile = await readStringFromFile(launchFilePath);

    if(!launchFile){
        console.error(`Could not read launch.json, path: ${launchFilePath}`);
        return;
    }

    const fixedLaunchFile = repairLaunchFile(launchFile);

    let isRepairedJson = false;
    if(!fixedLaunchFile){
        console.error("Repaired json was empty!");
    }
    else if(fixedLaunchFile !== launchFile){
        console.log("Malformed json in launch.json was repaired!");
        isRepairedJson = true;
    }
    else {
        console.log("No fixes need for malformed json!");
    }

    const unModifiedLaunchFileJson = jsonParseSafe(fixedLaunchFile) as LaunchJson;
    const launchFileJson = jsonParseSafe(fixedLaunchFile) as LaunchJson;  // Need to be two different objects

    if(!unModifiedLaunchFileJson || !launchFileJson){
        console.error("Couldn't parse json from launch.json!"
            + "\n*** Try resetting your project(Generate Project Files).");
        
        return;
    }

    const configs = launchFileJson.configurations;

    if(!configs?.length){
        console.error("Could not get launch configs!");
        return;
    }

    console.log("Checking for deprecated external console...");
    let errors = 0;
    for(const config of configs){
        errors = fixExternalConsole(config) ? errors +=1 : errors += 0;

        if(config.console === OLD_REPLACEMENT_CONSOLE_SETTING){  // Match UE4 with default UE5 settings(previous fix was wrong setting)
            config.console = REPLACEMENT_CONSOLE_SETTING;
            errors += 1;
        }
    }

    if(errors){
        console.log(`Errors fixed: ${errors}`);
    }

    if(errors || isRepairedJson){
        console.log("Writing launch.json...");
        await writeJsonOrStringToFile(launchFilePath, launchFileJson); 
    }
    else{
        console.log("There was nothing to fix!");
    }
        
    return;
    
}


function fixExternalConsole(launchObject: LaunchObjectJson): hasFixed {
    
    if(!launchObject.externalConsole){
        return false;
    }
    
    delete launchObject.externalConsole;
    launchObject.console = REPLACEMENT_CONSOLE_SETTING;

    return true;
}


function repairLaunchFile(launchFileStr: string) : string {

    console.log("\nAttempting to fix the json of launch.json...");

    let fileString;

    try {
        fileString = launchFileStr.replace(consts.RE_LAUNCH_SOURCE_FILE_MAP, `D:\\\\build\\\\++UE5\\\\Sync`);
    } catch (error) {
        console.error("Replace all exception!");
        if(error instanceof Error){
            console.error(`${error.message}`);
        }
        console.error("Will use original launch file string...");
        return launchFileStr;
    }

    console.log("Returning fixed launch file string.");
    return fileString;
 
}
