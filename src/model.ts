
import * as vscode from 'vscode';

import { CCppProperties } from './ntypes';
import * as shared from './shared';
import * as consts from './consts';

import * as console from './console';

/**
 * Refactorable first attempt but it works so...
 */
export class Model
{
    protected _cCppPropertiesInfo: Record<string, {path: string, cCppProperties: CCppProperties}> = { };

    /**
     * Get copy of stored json object
     * @param workspace workspace where config is stored, workspace.name is used as a key
     */
    async getCCppPropertiesCopy(workspace: vscode.WorkspaceFolder | undefined): Promise<CCppProperties | undefined> {
        if (!workspace?.name){
            console.error("getCCppConfigCopy() was give an bad workspace.");
            return;
        }
        const key = workspace.name;

        if (this._cCppPropertiesInfo[key]){
            const jsonString = JSON.stringify(this._cCppPropertiesInfo[key].cCppProperties);
            return JSON.parse(jsonString);            
        }

        const foundCCppFiles = await shared.findVSCodeFolderFiles(workspace, consts.GLOB_C_CPP_PROPERTIES_FILENAME);    

        if (!foundCCppFiles?.length) {
            console.log(`No ${key} ${consts.GLOB_C_CPP_PROPERTIES_FILENAME} files found for getCCppConfigCopy().`);
            return;
        }
        
        const path = foundCCppFiles[0].fsPath;
        const jsonString = await shared.readJsonStringFromFile(foundCCppFiles[0].fsPath);

        if(!jsonString){
            console.error(`${key} ${consts.GLOB_C_CPP_PROPERTIES_FILENAME} file read as empty json string.`);
            return;
        }


        const jsonObject : CCppProperties =  shared.jsonParseSafe(jsonString);
        this._cCppPropertiesInfo[key] = {path: path, cCppProperties: jsonObject};

        if (!jsonObject){
            return;
        }

        return JSON.parse(jsonString) as CCppProperties;
    }
    
    /**
     * Writes data to disk only if it doesn't match original
     * @param key 
     * @param cCppProperties copy of orginal
     * 
     * @todo Make this call a generic function that does the same thing?
     */
    async writeCCppProperties(workspace: vscode.WorkspaceFolder | undefined, cCppProperties : CCppProperties | undefined) {

        if(!workspace?.name){
            console.error(`Bad params in writeCCppProperties: ${!!workspace?.name}`);
            return;
        }

        if(!cCppProperties){
            console.log("No need to write CCppProperties. It's undefined.");
            return;
        }
        
        const originalAsObject = this._cCppPropertiesInfo[workspace.name].cCppProperties;
        const originalString = JSON.stringify(originalAsObject, undefined, consts.JSON_SPACING);
        const copyString = JSON.stringify(cCppProperties, undefined, consts.JSON_SPACING);

        if( originalString === copyString){
            console.log("No need to write CCppProperties. It was unchanged.");
            return;
        }

        console.log(`\nWriting ${this._cCppPropertiesInfo[workspace.name].path} to file.`);
        await shared.writeJsonToFile(this._cCppPropertiesInfo[workspace.name].path, copyString);
    }
}
