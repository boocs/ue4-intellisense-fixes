/**
 * The UE4 workspace doesn't specify a tag parser path list. This leads to parsing the whole UE4 source folder for symbols we don't need.
 * The tag parser combines all workspaces together and main workspace has everything the tag parser needs anyway.
 * Because of this, we just need to set tag parser includes to an empty array.
 * 
 * We also check to see if limitSymbolsToIncludedHeaders is set in the main workspace. We add it if it's not. 
 * This is needed for this to work.
 */

import { CONFIG_SETTING_LIMIT_SYMBOLS_TO_INCLUDED_HEADERS } from "../../consts";
import type { ProjectUE4 } from "../../project/projectUE4";
import type { CCppConfigurationJson } from "../../project/ntypes";

import * as console from "../../console";


export function fixTagIncludes(project: ProjectUE4) {
    console.log("Attempting to fix UE4 workspace(Add empty tag parser).");

    const config = project.getFirstCCppPropertiesConfiguration(project.ue4WorkspaceKey);

    if (!config) {
        console.error(`Error: UE4CCppProperties isn't valid`);
        return;
    }
    
    config.browse = { path: [] };
    console.log("UE4's tag parser includes is set to empty array for performance.");
    checkAndAddLimitSymbolsSetting(project);
}


function checkAndAddLimitSymbolsSetting(project: ProjectUE4){
    const mainCCppSettings = project.getCCppSettingsConfig(project.mainWorkspaceKey);

    if(!mainCCppSettings){
        console.error("Couldn't get main settings config.");
        return;
    }

    const limitSymbolsSettings = mainCCppSettings.get<boolean>(CONFIG_SETTING_LIMIT_SYMBOLS_TO_INCLUDED_HEADERS);

    if(limitSymbolsSettings === true){
        console.log("The setting limitSymbolsToIncludedHeaders is already set to true.");
        return;
    }
    else {
        const firstMainCCppPropertiesConfig = project.getFirstCCppPropertiesConfiguration(project.mainWorkspaceKey);

        if(!firstMainCCppPropertiesConfig){
            return;
        }

        setLimitSymbolsInCCppConfig(firstMainCCppPropertiesConfig);
    }
}


function setLimitSymbolsInCCppConfig(outConfig: CCppConfigurationJson) {
    console.log("Setting limitSymbolsToIncludedHeaders to true in main workspace's c_cpp_properties.");

    if(!outConfig.browse){
        outConfig.browse = {};
    }

    outConfig.browse.limitSymbolsToIncludedHeaders = true;
}
