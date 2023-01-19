/**
 * Defines list doesn't get filled. This fix uses a force include of the file that has them.
 */

import * as vscode from 'vscode';

import * as consts from '../../consts';
import * as text from '../../text';
import type { ProjectUE4 } from '../../project/projectUE4';
import * as shared from '../../shared';

import * as console from '../../console';


export async function fixNoDefines(project: ProjectUE4) {

    console.log("Attempting to fix No Defines.");

    const mainFirstConfiguration = project.getFirstCCppPropertiesConfiguration(project.mainWorkspaceKey);

    if (!mainFirstConfiguration || mainFirstConfiguration.defines?.length) {
        console.log(`c_cpp_properties.json(${mainFirstConfiguration}) already has defines. No fix needed.`);
        return;
    }

    const mainSettingsConfig = project.getCCppSettingsConfig(project.mainWorkspaceKey);

    if (!mainSettingsConfig) {
        console.error("Couldn't get main settings config.");
        return;
    }

    const forcedIncludePaths: string[] | undefined = mainSettingsConfig.get(consts.CONFIG_SETTING_DEFAULT_FORCED_INCLUDE);

    if (forcedIncludePaths) {

        const hasForcedDefinesFile = forcedIncludePaths.some(value => {
            return value.includes(consts.QUICK_CHECKER_DEFINITIONS_FILE);
        });

        if (hasForcedDefinesFile) {
            console.log("Already has defines file in forced include. No fix needed.");
            return;
        }
    }

    await addDefinesToForcedInclude(project.mainWorkspaceFolder, mainSettingsConfig, forcedIncludePaths);

}


async function addDefinesToForcedInclude(mainWorkspace: vscode.WorkspaceFolder, cppSettings: vscode.WorkspaceConfiguration,
    forcedIncludePaths: string[] | undefined | null): Promise<void> {

    const definesUris: vscode.Uri[] | undefined = await findDefintionUris(mainWorkspace);

    if (!definesUris?.length) { // If no defines files were found, display message to build.
        await vscode.window.showInformationMessage(text.MESSAGE_BUILD_SUCCESSFUL_PROJECT, text.OK);
        return;

    }
    let definitionsUri = definesUris.find(value => {
        return value.fsPath.includes(consts.UE4_BUILD_CONFIGURATION_DEVELOPMENT);  // Use development version if it's there
    });

    if (!definitionsUri) {
        definitionsUri = definesUris[0]; // else just use first found defines file
    }

    if (!forcedIncludePaths) {
        forcedIncludePaths = [definitionsUri.fsPath];
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

    return;
}

async function findDefintionUris(mainWorkspace: vscode.WorkspaceFolder): Promise<vscode.Uri[] | undefined> {
    const relPatternMainWorkspaceDefineFiles = new vscode.RelativePattern(mainWorkspace, consts.GLOB_DEFINITIONS_FILES);

    let definesUris: vscode.Uri[] | undefined = undefined;
    
    try {
        definesUris = await shared.findFiles(relPatternMainWorkspaceDefineFiles, null);
    }
    catch (error) {
        console.error("Error occurred while finding defines files.");
        return;
    }

    return definesUris;
}
