/**
 * The UE4 workspace doesn't specify a tag parser path list. This leads to parsing the whole UE4 source folder for symbols we don't need.
 * The tag parser combines all workspaces together and main workspace has everything the tag parser needs anyway.
 * Because of this, we just need to set tag parser includes to an empty array.
 * 
 * Also there seems to be a bug where this is the only way to reduce tag parser cache and speed things up some.
 * There seems to be no loss of functionality
 */

 import * as vscode from "vscode";

import { CCppProperties } from "../../ntypes";

import * as console from "../../console";


export async function fixTagIncludes(outCCppProperties: CCppProperties | undefined, ue4Workspace: vscode.WorkspaceFolder) {
    console.log("Attempting to fix Tag Includes.");

    const config = outCCppProperties?.configurations?.[0];

    if (!config) {
        console.error(`Error: outCCppProperties = ${outCCppProperties?.configurations?.length}`);
        return;
    }
    
    config.browse = { path: [] };
        
    console.log("End Tag Includes.\n");
}
