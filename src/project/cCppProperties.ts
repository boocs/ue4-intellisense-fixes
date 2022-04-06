
import * as vscode from 'vscode';

import { existsSync } from 'fs';

import * as shared from '../shared';
import * as consts from '../consts';
import type { CCppPropertiesJson, CCppConfigurationJson } from './ntypes';

import * as console from '../console';


export class CCppProperties
{
    protected _isValid = false;

    protected _workspace : vscode.WorkspaceFolder | undefined;
    protected _cCppPropertiesPath : string | undefined;
    protected _cCppPropertiesJson : CCppPropertiesJson | undefined;

    constructor(workspace: vscode.WorkspaceFolder) {
        this._workspace = workspace;
        this._cCppPropertiesPath = undefined;
        this._cCppPropertiesJson = undefined;
    }

    public get isValid(): boolean {
        return this._isValid;
    }

    public get configurations() : CCppConfigurationJson[] | undefined {
        return this._cCppPropertiesJson?.configurations;
    }
    

    protected get workspace(): vscode.WorkspaceFolder | undefined {
        return this._workspace;
    }

    protected get path(): string | undefined {
        return this._cCppPropertiesPath;
    }

    /**
     * Creates the CCppProperties and stores it in the class
     * @logs console.error
     */
    public async initialize(): Promise<void> {

        const workspace = this.workspace;

        if (!workspace){
            console.error("getCCppConfig() was given an undefined workspace.");
            return;
        }
        
        if (this._cCppPropertiesJson){  // Check if already initialized
            console.log("cCppProperties is already initialized.");
            return;            
        }

        const foundCCppFiles = await shared.findVSCodeFolderFiles(workspace, consts.GLOB_C_CPP_PROPERTIES_FILENAME);    

        if (!foundCCppFiles?.length) {
            console.error(`No files found for getCCppConfigCopy().`);
            return;
        }
        
        this._cCppPropertiesPath = foundCCppFiles[0].fsPath;
        this._cCppPropertiesJson = await this.getCurrentCCppProperties(this.path);

        if(!this._cCppPropertiesJson) {
            return;
        }

        this._isValid = true;
    }
    
    
    /**
     * Compares file to orginal but only copies/writes configurations var if not equal
     */
    public async writeConfigurationsIfNotEqual() {
        if(!this._isValid){
            console.error("This c_cpp_properties.json isn't validated. Can't write.");
            return;
        }

        if(!this._cCppPropertiesJson){
            console.log("No need to write CCppProperties. It's undefined.");
            return;
        }
        
        const modifiedCCppProperties = this._cCppPropertiesJson;
        const currentCCppProperties = await this.getCurrentCCppProperties(this.path);

        if(!currentCCppProperties){
            console.error(`Couldn't get currrent ${this.workspace} c_cpp_properties.json for comparison. Try resetting your project.`);
            return;
        }

        const modifiedCCppPropertiesString = JSON.stringify(modifiedCCppProperties, undefined, consts.JSON_SPACING);
        let currentCCppPropertiesString = JSON.stringify(currentCCppProperties, undefined, consts.JSON_SPACING);

        if( modifiedCCppPropertiesString === currentCCppPropertiesString){
            console.log(`No need to write ${this.workspace?.name} CCppProperties. It was unchanged.`);
            return;
        }

        if(!(this.path && existsSync(this.path))){
            console.error(`${this.workspace?.name} CCppProperties path is invalid. Will not write.`);
            return;
        }

        console.log(`\nWriting ${this.path} to file.`);
        currentCCppProperties.configurations = modifiedCCppProperties.configurations;
        currentCCppPropertiesString = JSON.stringify(currentCCppProperties, undefined, consts.JSON_SPACING);

        await shared.writeJsonOrStringToFile(this.path, currentCCppPropertiesString);
    }


    protected async getCurrentCCppProperties(path: string | undefined) : Promise<CCppPropertiesJson | undefined> {
        
        if(!path){
            console.error(`No path for ${this.workspace?.name} CCppProperties file found.`);
            return;
        }

        // Needs to be synchronous for when we read and then write in our write function
        const currentFileString = await shared.readStringFromFile(path);

        if (!currentFileString) {
            console.error(`Error while reading ${this.workspace?.name} CCppProperties file.`);
            return;
        }

        return shared.jsonParseSafe(currentFileString);
    }

}
