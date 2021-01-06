
import * as vscode from 'vscode';

import * as shared from '../../shared';
import { CCppProperties, CCppConfiguration} from '../../ntypes';
import { GLOB_C_CPP_PROPERTIES_FILENAME} from '../../consts';

import * as console from '../../console';


/**
 * When switching to a different project, UE4 4.26 will have the old project's compileCommand path
 * in it's c_cpp_properties.json file.
 */
export async function fixWrongProject(outCCppProperties: CCppProperties | undefined){
    
    console.log("Attempting to fix wrong project.");

    // Only fix first config found
    const config = outCCppProperties?.configurations?.[0];
    if (!config){
        console.error("CCppProperties param error in fixWrongProject()");
        return;
    }
    
    await fixCompileCommandPath(config);
    await fixName(config);

    console.log("End wrong project.\n");    
}


async function fixCompileCommandPath(outCCppConfig: CCppConfiguration) {
    
    const uprojectName = await shared.getProjectsUProjectName();
    // @todo Set name as well? 
    
    const correctedPath = await getCorrectCompileCommandPath(uprojectName, outCCppConfig.compileCommands);

    if (!correctedPath){
        return;
    }

    console.log("Changing config's path.");
    outCCppConfig.compileCommands = correctedPath; 
}

async function fixName(outCCppConfig: CCppConfiguration) {

    
    const mainCCppPropertiesFiles = await shared.findVSCodeFolderFiles(await shared.getUE4ProjectsMainWorkspace(), GLOB_C_CPP_PROPERTIES_FILENAME);

    if (!mainCCppPropertiesFiles?.length){
        console.error("Couldn't find main workspace's c_cpp_properties.json.");
        return;
    }

    // First file found
    const mainCCppProperties: CCppProperties = JSON.parse(await shared.readJsonStringFromFile(mainCCppPropertiesFiles[0].fsPath));
    // First config
    const mainCCppConfigName = mainCCppProperties?.configurations?.[0]?.name;

    if(!mainCCppConfigName){
        console.error("Bad mainCCppProperties in mainCCppPropertiesFiles.");
    }

    if(outCCppConfig.name !== mainCCppConfigName){
        outCCppConfig.name = mainCCppConfigName;
    }
}


/**
 * Return the current project's compileCommands_ProjectName.json in the UE4's .vscode folder. Uses a glob pattern to search for it.
 * 
 * @param uprojectName 
 * @param compileCommandsPath
 * @returns Empty string on error or compileCommandsPath is correct
 * 
 * @logs console.log When no fixes needed
 * @logs console.error When no fix on errors
 */
async function getCorrectCompileCommandPath(uprojectName: string, compileCommandsPath: string | undefined) : Promise<string> {
    if (!compileCommandsPath){
        // This is legacy from when trying settings.json. This will probably never be blank. Still will keep...
        console.log("Configs compile commands path is blank. Assuming using alternative fix.");
        return "";
    }

    if (compileCommandsPath.endsWith(`/compileCommands_${uprojectName}.json`) || compileCommandsPath.endsWith(`\\compileCommands_${uprojectName}.json`)){
        console.log("Config's compile commands path is correct.");
        return "";
    }

    const ue4WorkspaceFolder = shared.getUE4WorkspaceFolder();
    if(!ue4WorkspaceFolder){
        return "";
    }
    const relativePattern = new vscode.RelativePattern(ue4WorkspaceFolder, shared.getGlobCompileCommandFiles(uprojectName));
    const projectCompileCommandFile =  await vscode.workspace.findFiles(relativePattern, undefined, 1);

    if (!projectCompileCommandFile?.length){
        console.error("No project's compile command file found in UE4's .vscode folder.");
        return "";
    }

    return projectCompileCommandFile[0].fsPath;
}
