

import * as vscode from "vscode";

import { CCppProperties } from "./cCppProperties";
import { ValidatedBuilderBase, IsValid } from "./builderBase";
import type { CCppConfigurationJson, LaunchJson } from "./ntypes";
import { CompileCommands } from "./compileCommands";

import * as console from "../console";


export type WorkspaceSetupVars = {
    configurationsWorkspace: vscode.WorkspaceFolder | undefined;
    propertiesWorkspace: vscode.WorkspaceFolder | undefined
};

export type WorkspaceKey = string;
export type ConfigIndex = string;

export const CONFIG_SECTION_C_CPP = "C_Cpp";


export abstract class ProjectCCpp extends ValidatedBuilderBase {

    private _cCppSettings: Map<WorkspaceKey, vscode.WorkspaceConfiguration | undefined> | undefined;
    private _cCppProperties: Map<WorkspaceKey, CCppProperties | undefined> | undefined;
    private _compileCommands: Map<WorkspaceKey, Map<ConfigIndex, CompileCommands>> | undefined;

    protected constructor() {
        super();
    }

    protected async cCppPostConstructionSetup(setupVars: Record<WorkspaceKey, WorkspaceSetupVars>): Promise<IsValid> {

        let isValid = super.basePostConstructionSetup();
        
        if (!isValid) {
            return false;
        }
        
        const cCppSettings = this.createConfigurations(setupVars);
        const cCppProperties = await this.createProperties(setupVars);

        this._cCppSettings = cCppSettings;
        this._cCppProperties = cCppProperties;

        return true;
    }


    private createConfigurations(setupVars: Record<WorkspaceKey, WorkspaceSetupVars>): Map<WorkspaceKey, vscode.WorkspaceConfiguration | undefined> | undefined {

        const workspaceConfigurations = new Map<WorkspaceKey, vscode.WorkspaceConfiguration | undefined>();

        for (let [key, workspaceSetupVars] of Object.entries(setupVars)) {

            const workspace = workspaceSetupVars.configurationsWorkspace;

            if (workspace === undefined) {
                workspaceConfigurations.set(key, undefined);
                continue;
            }

            const configuration = vscode.workspace.getConfiguration(CONFIG_SECTION_C_CPP, workspace);

            if (!configuration) {
                console.error(`Couldn't create ${workspace} workspace settings ${CONFIG_SECTION_C_CPP} configuration;`);
                return undefined;
            }

            workspaceConfigurations.set(key, configuration);

        }

        return workspaceConfigurations;
    }


    private async createProperties(setupVars: Record<WorkspaceKey, WorkspaceSetupVars>): Promise<Map<WorkspaceKey, CCppProperties | undefined> | undefined> {
        const workspaceProperties = new Map<WorkspaceKey, CCppProperties | undefined>();

        for (let [key, workspaceSetupVars] of Object.entries(setupVars)) {

            const workspace = workspaceSetupVars.propertiesWorkspace;

            if (workspace === undefined) {
                workspaceProperties.set(key, undefined);
                continue;
            }

            const properties = new CCppProperties(workspace);
            await properties.initialize();

            if (!properties.isValid) {
                return undefined;
            }

            workspaceProperties.set(key, properties);

        }

        return workspaceProperties;
    }


    /**
     * VSCode workspace configuration settings (non c_cpp_properties.json)
     * @param workspaceKey 
     */
    public getCCppSettingsConfig(workspaceKey: WorkspaceKey): vscode.WorkspaceConfiguration | undefined {
        if (this._cCppSettings) {
            const isKeyValid = this._cCppSettings.has(workspaceKey);
            if (!isKeyValid) {
                console.error(`${workspaceKey} in cCppSettings doesn't exits.`);
                return;
            }

            const settings = this._cCppSettings.get(workspaceKey);

            if (settings) {
                return settings;
            }
            else {
                console.error(`The ${workspaceKey} CCpp settings wasn't configured to be created at construction setup.`);
                return;
            }

        }
        else {
            console.error(`cCppSetting weren't created at construction setup.`);
            return;
        }
    }


    /**
     * @param workspaceKey
     * @returns undefined on error
     */
    protected getCCppProperties(workspaceKey: string): CCppProperties | undefined {
        if (this._cCppProperties) {
            const isKeyValid = this._cCppProperties.has(workspaceKey);
            if (!isKeyValid) {
                console.error(`${workspaceKey} in cCppProperties doesn't exits.`);
                return;
            }

            const properties = this._cCppProperties.get(workspaceKey);
            if (properties) {
                return properties;
            }
            else {
                console.error(`The ${workspaceKey} CCPP properties was configured to not be created at construction setup.`);
                return;
            }

        }
        else {
            console.error(`The ${workspaceKey} cCppProperties wasn't enabled at construction setup.`);
            return;
        }
    }

    /**
     * Configurations stored in the c_cpp_properties.json
     * @param workspaceKey 
     * @param index 
     */
    public getCCppConfiguration(workspaceKey: WorkspaceKey, index: number): CCppConfigurationJson | undefined {
        const configurations = this.getCCppProperties(workspaceKey)?.configurations;

        if (!configurations) {
            console.log(`No ${workspaceKey} configurations found.`);
            return undefined;
        }

        const configuration = configurations?.[index];

        if (!configuration) {
            console.error(`${workspaceKey} configuration at index ${index} does not exists.`);
            return undefined;
        }

        return configuration;
    }

    /**
     * Configurations stored in the c_cpp_properties.json
     * @param workspaceKey 
     */
     public getCCppConfigurationsFromWorkspace(workspaceKey: WorkspaceKey): CCppConfigurationJson[] | undefined {
        const configurations = this.getCCppProperties(workspaceKey)?.configurations;

        if (!configurations) {
            console.log(`No ${workspaceKey} configurations found.`);
            return undefined;
        }

        return configurations;
    }


    /**
     * @param workspaceKey defaults to undefined to save all stored c_cpp_properties.json files.
     */
    public async saveCCppProperties(workspaceKey: WorkspaceKey | undefined = undefined) {
        if (!workspaceKey) {

            const allCCppProperties = this._cCppProperties;
            if (!allCCppProperties) {
                return;
            }

            for (let [workspaceKey, cCppProperties] of allCCppProperties) {
                await cCppProperties?.writeConfigurationsIfNotEqual();
            }
            return;
        }

        const properties = this.getCCppProperties(workspaceKey);
        if (properties) {
            await properties.writeConfigurationsIfNotEqual();
        }

    }


    /**
     * Validated creation
     * 
     * @param workspaceKey 
     * @param configIndex 
     * 
     * @returns false on error
     */
    public async loadCompileCommandsFromConfig(workspaceKey: WorkspaceKey, configIndex: number): Promise<boolean> {
        if (!this._compileCommands) {
            this._compileCommands = new Map<WorkspaceKey, Map<ConfigIndex, CompileCommands>>();
        }

        const cCppProperties = this.getCCppProperties(workspaceKey);
        if (!cCppProperties) {
            return false;
        }

        const compileCommandsPath = cCppProperties.configurations?.[configIndex].compileCommands;
        if (!compileCommandsPath) {
            console.error(`Error getting compile commands path from ${workspaceKey} c_cpp_properties.json at config index ${configIndex}.`);
            return false;
        }

        const compileCommands = await CompileCommands.create(compileCommandsPath);
        if (!compileCommands.isValid) {
            return false;
        }

        if (!this._compileCommands.has(workspaceKey)) {
            this._compileCommands.set(workspaceKey, new Map<ConfigIndex, CompileCommands>());
        }

        const workspaceCompileCommands = this._compileCommands.get(workspaceKey);
        if (!workspaceCompileCommands) {
            console.error(`${workspaceKey} Compile Commands wasn't set.`);
            return false;
        }

        workspaceCompileCommands.set(configIndex.toString(), compileCommands);

        return true;
    }

    public getCompileCommandsAtConfigIndex(workspaceKey: WorkspaceKey, configIndex: number): CompileCommands | undefined {
        return this._compileCommands?.get(workspaceKey)?.get(configIndex.toString());
    }

    /**
     * Validated creation
     * 
     * @param workspaceKey 
     * 
     * @returns false on 0 compile commands being loaded
     */
    public async loadCompileCommandsFromWorkspace(workspaceKey: WorkspaceKey): Promise<boolean> {
        if (!this._compileCommands) {
            this._compileCommands = new Map<WorkspaceKey, Map<ConfigIndex, CompileCommands>>();
        }

        const cCppProperties = this.getCCppProperties(workspaceKey);
        if (!cCppProperties) {
            console.error(`Error, no getCCppProperties with key:${workspaceKey}!`)
            return false;
        }

        if (!cCppProperties.configurations) {
            console.error(`Error, no cCppProperties.configurations with key:${workspaceKey}!`)
            return false;
        }


        for (const configIndex in cCppProperties.configurations) {

            const compileCommandsPath = cCppProperties.configurations?.[configIndex].compileCommands;
            if (!compileCommandsPath) {
                console.error(`${configIndex}: No compileCommandsPath found in cCppProperties with key:${workspaceKey}! (not an error with UE 4.25.#)`)  // Does 4.25 even use this function?
                continue;
            }

            const compileCommands = await CompileCommands.create(compileCommandsPath);
            if (!compileCommands.isValid) {
                console.error(`${configIndex}: Couldn't create compileCommands from ${compileCommandsPath} with key:${workspaceKey}! (not an error with UE 4.25.#)`)
                continue;
            }

            if (!this._compileCommands.has(workspaceKey)) {
                this._compileCommands.set(workspaceKey, new Map<ConfigIndex, CompileCommands>());
            }

            const workspaceCompileCommands = this._compileCommands.get(workspaceKey);
            if (!workspaceCompileCommands) {
                console.error(`${configIndex}: ${workspaceKey} Compile Commands wasn't set.`);
                continue;
            }

            workspaceCompileCommands.set(configIndex.toString(), compileCommands);

        }

        if(!this._compileCommands.get(workspaceKey)?.size) {
            console.error(`Did not create any compile commands with key${workspaceKey}! (not an error with UE 4.25.#)`);
            return false;
        }
        
        return true;
    }

    public getCompileCommandsFromWorkspace(workspaceKey: WorkspaceKey) : Map<string, CompileCommands> | undefined {
    
        return this._compileCommands?.get(workspaceKey);
    }

}
