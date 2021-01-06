
import * as vscode from 'vscode';

import * as shared from '../../shared';
import * as consts from '../../consts';
import { CCppProperties, CCppConfiguration} from '../../ntypes';
import { TEXT_MESSAGE_BUILD_SUCCESSFUL_PROJECT, TEXT_OK } from '../../text';

import * as console from '../../console';


export async function fixUE4Source(outUE4CCppProperties: CCppProperties | undefined) {
    console.log("Attempting to fix UE4 Source Intellisense.");

    if (!outUE4CCppProperties?.configurations?.length){
        console.error(`Bad outUE4CCppProperties for fixUE4Source(): ${outUE4CCppProperties}`);
        return;
    }

    fixIncludePath(outUE4CCppProperties.configurations[0]);
    fixBrowsePath(outUE4CCppProperties.configurations[0]);
    await fixForcedInclude(outUE4CCppProperties.configurations[0]);

    console.log("End UE4 Source.\n");
}


function fixIncludePath(outCCppConfig: CCppConfiguration) {
    
    if (!outCCppConfig.includePath){
        outCCppConfig.includePath = consts.CONFIG_VALUES_UE4_SOURCE_INCLUDE_PATHS;
        console.log("Fixing include path.");
        return;
    }
    else {
        for (const value of consts.CONFIG_VALUES_UE4_SOURCE_INCLUDE_PATHS){
            if(!outCCppConfig.includePath.includes(value)){
                outCCppConfig.includePath.push(value);
                console.log("Fixing include path.");
            }
        }
    }
}

function fixBrowsePath(outCCppConfig: CCppConfiguration) {

    if (!outCCppConfig.browse?.path?.length){
        console.log("Fixing browse path.");
        
        outCCppConfig.browse = {};
        outCCppConfig.browse.path = consts.CONFIG_VALUES_UE4_SOURCE_BROWSE_PATHS;
        return;
    }
    else {
        for (const value of consts.CONFIG_VALUES_UE4_SOURCE_BROWSE_PATHS){
            if(!outCCppConfig.browse.path.includes(value)){
                outCCppConfig.browse.path.push(value);
                console.log("Fixing browse path.");
            }
        }
    }
}


async function fixForcedInclude(outCCppConfig: CCppConfiguration) {
    const forcedPath = await getForcedPath();
    if (!forcedPath){
        vscode.window.showInformationMessage(TEXT_MESSAGE_BUILD_SUCCESSFUL_PROJECT, TEXT_OK);
        return;
    }


    // If forced path is already in forcedInclude
    if (outCCppConfig.forcedInclude?.find( pathValue => shared.isEqualPaths(pathValue, forcedPath)))  {
        return;   
    }
    
    console.log("Fixing forced include.");

    outCCppConfig.forcedInclude = [
        consts.VSCODE_SPECIAL_VAR_DEFAULT,
        forcedPath
    ];
}

async function getForcedPath() : Promise<string | undefined> {
    const mainWorkspace = await shared.getUE4ProjectsMainWorkspace();
    if (!mainWorkspace){
        return;
    }

    const relPatern = new vscode.RelativePattern(mainWorkspace, consts.GLOB_DEFINITIONS_FILES);
    const definitionFiles = await vscode.workspace.findFiles(relPatern);

    if (!definitionFiles.length) {
        return;
    }

    // Use Development config definitions file if there
    const forcedPath = definitionFiles.find( uri => uri.fsPath.includes(consts.UE4_BUILD_CONFIGURATION_DEVELOPMENT)); 

    return forcedPath ? forcedPath.fsPath : definitionFiles[0].fsPath; // or just use first one found
}