
import * as vscode from 'vscode';

import { CCppProperties } from './ntypes';
import * as shared from './shared';
import * as consts from './consts';

import * as console from './console';


export class CCppPropertiesObject
{
    protected workspace : vscode.WorkspaceFolder | undefined;
    protected cCppPropertiesPath : string | undefined;
    protected cCppProperties : CCppProperties | undefined;

    constructor(workspace: vscode.WorkspaceFolder | undefined) {
        this.workspace = workspace;
        this.cCppPropertiesPath = undefined;
        this.cCppProperties = undefined;
    }
    /**
     * Gets json object copy from file found in stored workspace folder. Any subsequent calls will return stored object copy.
     * @param workspace workspace where config is stored
     * @returns CCppProperties
     * @logs console.error
     */
    async getObjectCopy(): Promise<CCppProperties | undefined> {

        const workspace = this.workspace;

        if (!workspace){
            console.error("getCCppConfig() was given an undefined workspace.");
            return;
        }
        
        if (this.cCppProperties){  // There's already one stored so just get a copy of it
            const jsonString = JSON.stringify(this.cCppProperties);
            return JSON.parse(jsonString);            
        }

        const foundCCppFiles = await shared.findVSCodeFolderFiles(workspace, consts.GLOB_C_CPP_PROPERTIES_FILENAME);    

        if (!foundCCppFiles?.length) {
            console.error(`No files found for getCCppConfigCopy().`);
            return;
        }
        
        const path = foundCCppFiles[0].fsPath;
        const jsonString = await shared.readJsonStringFromFile(path);

        if(!jsonString){
            console.error(`${workspace.name} ${consts.GLOB_C_CPP_PROPERTIES_FILENAME} file read as empty json string.`);
            return;
        }

        const jsonObject : CCppProperties =  shared.jsonParseSafe(jsonString);
        this.cCppPropertiesPath = path;
        this.cCppProperties = jsonObject;

        if (!jsonObject){
            console.error(`${workspace.name} ${consts.GLOB_C_CPP_PROPERTIES_FILENAME} file read as malformed json string.`);
            return;
        }

        return JSON.parse(jsonString) as CCppProperties;
    }
    
    /**
     * Writes data to disk only if it doesn't match original
     * @param cCppProperties copy of orginal
     */
    async writeIfNotEqual(cCppProperties : CCppProperties | undefined) {

        if(!cCppProperties){
            console.log("No need to write CCppProperties. It's undefined.");
            return;
        }
        
        const originalAsObject = this.cCppProperties;
        const originalString = JSON.stringify(originalAsObject, undefined, consts.JSON_SPACING);
        const copyString = JSON.stringify(cCppProperties, undefined, consts.JSON_SPACING);

        if( originalString === copyString){
            console.log("No need to write CCppProperties. It was unchanged.");
            return;
        }

        if (!this.cCppPropertiesPath){
            console.log(`There is no ${this.workspace?.name} cCppPropertiesPath!`);
            return;
        }

        console.log(`\nWriting ${this.cCppPropertiesPath} to file.`);
        await shared.writeJsonToFile(this.cCppPropertiesPath, copyString);
    }
}
