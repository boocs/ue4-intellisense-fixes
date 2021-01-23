/**
 * Defines list doesn't get filled. This fix uses a force include of the file that has them.
 */

import * as vscode from 'vscode';

import { CCppPropertiesObject } from '../../cCppPropObject';
import * as shared from '../../shared';
import * as consts from '../../consts';
import * as text from '../../text';

import * as console from '../../console';


export async function fixNoDefines() {

    console.log("Attempting to fix No Defines.");

    const mainWorkspace = await shared.getUE4ProjectsMainWorkspace();
    const mainCCppPropertiesObject = new CCppPropertiesObject(mainWorkspace);

    const mainCCppProperties = await mainCCppPropertiesObject.getObjectCopy();

    if (!mainCCppProperties?.configurations?.length){
        console.error("No main workspace c_cpp_properties/configurations found.");
        return;
    }

    if (mainCCppProperties.configurations[0].defines?.length) {
        console.log("c_cpp_properties already has defines. No fix needed.");
    }

    const cppSetting = vscode.workspace.getConfiguration(consts.CONFIG_SECTION_C_CPP, );

    const forcedIncludePaths : string[] | undefined = cppSetting.get(consts.CONFIG_SETTING_DEFAULT_FORCED_INCLUDE);

    const hasForcedDefinesFile = forcedIncludePaths?.some( value => {
            return value.includes(consts.QUICK_CHECKER_DEFINITIONS_FILE);
    });

    if(hasForcedDefinesFile){
        console.log("Already has defines file in forced include. No fix needed.");
        return;
    }
    else {
        await addDefinesToForcedInclude( mainWorkspace, cppSetting, forcedIncludePaths);
    }

    console.log("End No Defines.\n");
}


async function addDefinesToForcedInclude(mainWorkspace: vscode.WorkspaceFolder | undefined , cppSettings: vscode.WorkspaceConfiguration,
        forcedIncludePaths: string[] | undefined) {

    if (!mainWorkspace){
        console.error("Error: No main workspace.");
        return;
    }

    const relPatternMainWorkspaceDefineFiles = new vscode.RelativePattern(mainWorkspace, consts.GLOB_DEFINITIONS_FILES);
    
    let definesUris : vscode.Uri[] | undefined = undefined;
    try {
        definesUris = await vscode.workspace.findFiles(relPatternMainWorkspaceDefineFiles);
    }
    catch(error) {
        console.error("Error occurred while finding defines files.");
        return;
    }
    
    if (!definesUris?.length){ // If no defines files were found, display message to build.
        vscode.window.showInformationMessage(text.MESSAGE_BUILD_SUCCESSFUL_PROJECT, text.OK);
        return;
    }

    let definitionsUri = definesUris.find( value => {
        return value.fsPath.includes(consts.UE4_BUILD_CONFIGURATION_DEVELOPMENT);  // Use development version if there
    });
    
    if (!definitionsUri){
        definitionsUri = definesUris[0]; // else just use first found defines file
    }

    if (!forcedIncludePaths) {
        forcedIncludePaths = [ definitionsUri.fsPath ];
    }
    else {
        forcedIncludePaths.push(definitionsUri.fsPath);
    }

    
    try {
        console.log("Fixing No Defines.");
        await cppSettings.update(consts.CONFIG_SETTING_DEFAULT_FORCED_INCLUDE, forcedIncludePaths, false);
    } catch (error) {
        console.error("Error trying to update Forced Include setting.");
        return;
    }
}
