import * as vscode from "vscode";

import * as path from "path";
import { promises as fs } from 'fs';

import type { CCppConfigurationJson } from "./ntypes";
import { ProjectCCpp, WorkspaceKey, WorkspaceSetupVars } from "./projectCCpp";
import type { IsValid } from "./builderBase";
import * as consts from "../consts";
import * as shared from "../shared";

import * as console from "../console";


const MAIN_KEY = "MAIN";
const UE4_KEY = "UE";


export abstract class ProjectUE4 extends ProjectCCpp {

    protected static _ue4Version: {major: number, minor: number, patch: number} | undefined = undefined;

    private _mainWorkspaceFolder: vscode.WorkspaceFolder | undefined;
    private _ue4WorkspaceFolder: vscode.WorkspaceFolder | undefined;

    private _mainUProjectPath: string = "";
    private _mainUProjectName: string = "";

    protected constructor() {
        super();
    }


    public static get ue4VersionObject(): {major: number, minor: number, patch: number} | undefined {
        return ProjectUE4._ue4Version;
    }

    /**
     * @returns empty string if version hasn't been loaded
     */
    public static get ue4Version(): string {

        const version = ProjectUE4._ue4Version;

        if(!version){
            return "";
        }

        return `${version.major}.${version.minor}.${version.patch}`;
    }


    protected async ue4PostConstructionSetup(isUsedMainConfigurations: boolean, isUsedMainProperties: boolean, isUsedUE4Configurations: boolean, isUsedUE4Properties: boolean): Promise<IsValid> {

        let isValid = false;

        // **** NOTE **** Some of these vars rely on creation order so can't be changed.
        this._ue4WorkspaceFolder = ProjectUE4.findUE4Workspace();
        if (!this._ue4WorkspaceFolder) {
            return false;
        }

        isValid = await this.setupUprojectVars();
        if (!isValid) {
            return false;
        }
        
        this._mainWorkspaceFolder = await this.findMainWorkspace();
        if (!this._mainWorkspaceFolder) {
            return false;
        }

        const mainSetupVars: WorkspaceSetupVars = { configurationsWorkspace: isUsedMainConfigurations ? this.mainWorkspaceFolder : undefined, propertiesWorkspace: isUsedMainProperties ? this.mainWorkspaceFolder : undefined };
        const ue4SetupVars: WorkspaceSetupVars = { configurationsWorkspace: isUsedUE4Configurations ? this.ue4WorkspaceFolder : undefined, propertiesWorkspace: isUsedUE4Properties ? this.ue4WorkspaceFolder : undefined };

        isValid = await super.cCppPostConstructionSetup({ [MAIN_KEY]: mainSetupVars, [UE4_KEY]: ue4SetupVars });

        if (!isValid) {
            console.error("Error in cCppPostConstructionSetup!")
            return false;
        }

        
        return true;
    }


    public get ue4WorkspaceFolder(): vscode.WorkspaceFolder {
        if (this._ue4WorkspaceFolder) {
            return this._ue4WorkspaceFolder;
        }
        else {
            throw Error("UE Workspace folder was not set properly."); // This shouldn't be reached if we have good valid checks
        }
    }


    public get mainWorkspaceFolder(): vscode.WorkspaceFolder {
        if (this._mainWorkspaceFolder) {
            return this._mainWorkspaceFolder;
        }
        else {
            throw Error("Main Workspace folder was not set properly."); // This shouldn't be reached if we have good valid checks
        }
    }


    protected get mainUprojectPath(): string {
        return this._mainUProjectPath;
    }


    protected get mainUprojectName(): string {
        return this._mainUProjectName;
    }


    public getFirstCCppPropertiesConfiguration(workspaceKey: WorkspaceKey): CCppConfigurationJson | undefined {
        return super.getCCppConfiguration(workspaceKey, 0);
    }

    
    public get mainWorkspaceKey(): WorkspaceKey {
        return MAIN_KEY;
    }


    public get ue4WorkspaceKey(): WorkspaceKey {
        return UE4_KEY;
    }


    protected async setupUprojectVars(): Promise<IsValid> {
        const uprojectFiles: vscode.Uri[] = await this.nodeFindUProjectFiles();
        
        if (!uprojectFiles.length) {
            return false;
        }

        const parsedPath = path.parse(uprojectFiles[0].fsPath);

        this._mainUProjectPath = parsedPath.dir;
        this._mainUProjectName = parsedPath.name;

        return true; 
    }


    /** 
    * @returns returns undefined if not found
    * @logs If can't find workspace.
    */
    protected static findUE4Workspace(): vscode.WorkspaceFolder | undefined {

        const ueWorkspace = vscode.workspace.workspaceFolders?.find(workspaceFolder => {
            return (workspaceFolder.name === consts.WORKSPACE_FOLDER_NAME_UE4 || workspaceFolder.name === consts.WORKSPACE_FOLDER_NAME_UE5);
        });

        if (!ueWorkspace) {
            console.error("Couldn't find the UE4/UE5 workspace.");
            console.error("Try right-clicking your project's *.uproject file and choose Switch Engine Version. Select the same version as your project and hit ok.")
            return;
        }

        return ueWorkspace;
    }


    /**
    * @param excludeUE4 Defaults to true
    * 
    * @logs console.error When no uproject files found.
    * @todo Can exclude pattern work somehow to filter out ue4 folder? This function still works with alternate exclude using filter.
    */
    protected async findUProjectFiles(excludeUE4: boolean = true): Promise<vscode.Uri[] | undefined> {

        let uprojectFiles: vscode.Uri[] | undefined = undefined;
        try {
            uprojectFiles = await shared.findFiles(consts.GLOB_ANY_UPROJECT_IN_TOPLEVEL, null);
        }
        catch {
            console.error("Error finding uproject files in GetUprojectFiles()");
            return;
        }

        if (!uprojectFiles?.length) {
            console.error("No uproject files found.");
            return;
        }
        
        if (excludeUE4) {
            if (!this.ue4WorkspaceFolder) {
                console.error("UE Workspace Folder hasn't been set.");
                return;
            }

            try {
                uprojectFiles = await Promise.all(uprojectFiles.filter(uri => { return !uri.fsPath.includes(this.ue4WorkspaceFolder.uri.fsPath); }));
            }
            catch (error) {
                console.error("Error filtering uproject files in GetUProjectFiles(): (exclude UE4).");
                return;
            }
        }

        return uprojectFiles;
    }

    /**
    * 
    * @logs console.error When no uproject files found.
    * @todo Can exclude pattern work somehow to filter out ue4 folder? This function still works with alternate exclude using filter.
    */
     protected async nodeFindUProjectFiles(): Promise<vscode.Uri[]> {

        if(!vscode.workspace.workspaceFolders){
            console.error("No Workspace folders for finding UProject files!");
            return [];
        }

        let uprojectUris: vscode.Uri[] = [];
        for(const workSpace of vscode.workspace.workspaceFolders){
            if(workSpace.name === "UE4" || workSpace.name === "UE5"){
                continue;
            }
            
            //const uprojectFileNames: string[] = await fglob(consts.GLOB_ANY_UPROJECT_IN_TOPLEVEL, {cwd: uriPath});
            const relPattern = new vscode.RelativePattern(workSpace, consts.GLOB_ANY_UPROJECT_IN_TOPLEVEL)
            const uprojectUrisTemp = await shared.findFiles(relPattern, null);
            
            if(!uprojectUrisTemp.length){
                continue;
            }

            if(uprojectUrisTemp.length > 1){
                console.log(`WARNING: Multiple *.uproject files in ${workSpace.uri.path} may cause the extension to break!`)
            }

            uprojectUris.push(...uprojectUrisTemp);
        }

        if(!uprojectUris.length){
            console.error("No uproject files found!");
        }

        return uprojectUris;
        
    }

    
    /**
    * @returns undefined if nothing could be found
    * @logs If no workspaces found or main workspace not found
    */
    protected async findMainWorkspace(): Promise<vscode.WorkspaceFolder | undefined> {
        const mainWorkspacePath = this.mainUprojectPath;

        if (!vscode.workspace.workspaceFolders?.length) {
            console.log("No workspaces found in getMainWorkspace");
            return;
        }

        const workspace = vscode.workspace.workspaceFolders.find(workspaceFolder => {
            return path.normalize(workspaceFolder.uri.fsPath) === path.normalize(mainWorkspacePath);
        });

        if (!workspace) {
            console.error("Main workspace not found in getMainWorkspace");
            return;
        }

        return workspace;
    }

    public static async loadUE4Version(): Promise<void>{
        
        const ue4Workspace = ProjectUE4.findUE4Workspace();

        if (!ue4Workspace) {
            return;
        }

        const relPattern : vscode.RelativePattern = new vscode.RelativePattern(ue4Workspace, consts.GLOB_UE4_SOURCE_FILE_VERSION_H) ;
        const versionUri = await shared.findFiles(relPattern, null, 1);
        

        if(!versionUri.length){
            console.error("Couldn't find UE source file Version.h");
            return;
        }

        const versionStrings: RegExpMatchArray | null = await ProjectUE4.parseUnrealEngineVersionFrom(versionUri[0]);

        if(versionStrings?.length !== 3) {
            console.error("UE version strings weren't found.");
            return;
        }

        ProjectUE4._ue4Version = {major: parseInt(versionStrings[0]), minor:parseInt(versionStrings[1]), patch: parseInt(versionStrings[2])};
    }

    public static async loadNodeUE4Version(): Promise<void>{
        
        const ue4Workspace = ProjectUE4.findUE4Workspace();

        if (!ue4Workspace) {
            return;
        }

        //const ue4FsPath = ue4Workspace.uri.fsPath;
        //const ue4Path = ue4Workspace.uri.path;
        //const versionPath = path.join(ue4Path, consts.GLOB_UE4_SOURCE_FILE_VERSION_H);

        const versionUri = vscode.Uri.joinPath(ue4Workspace.uri, consts.GLOB_UE4_SOURCE_FILE_VERSION_H);
        
        let versionFileStat: vscode.FileStat | undefined = undefined;
        try {
            versionFileStat = await vscode.workspace.fs.stat(versionUri);
        } catch (error) {
            console.error("Exception: Couldn't find UE source file Version.h");
            if(error instanceof Error){
                console.error(`Exception message: ${error.message}`);
            }
            
            return;
        }
        
        if(!versionFileStat || versionFileStat.size === 0){
            console.error("Couldn't find UE source file Version.h");
            return;
        }

        //const relPattern : vscode.RelativePattern = new vscode.RelativePattern(ue4Workspace, consts.GLOB_UE4_SOURCE_FILE_VERSION_H) ;
        //const versionUri = await vscode.workspace.findFiles(relPattern, null, 1);
        
        //if(!versionUri.length){
        //    console.error("Couldn't find UE source file Version.h");
        //    return;
        //}

        const versionStrings: RegExpMatchArray | null = await ProjectUE4.parseUnrealEngineVersionFrom(versionUri);

        if(versionStrings?.length !== 3) {
            console.error("UE version strings weren't found.");
            return;
        }

        ProjectUE4._ue4Version = {major: parseInt(versionStrings[0]), minor:parseInt(versionStrings[1]), patch: parseInt(versionStrings[2])}; 
    }

    
    protected static async parseUnrealEngineVersionFrom(uri: vscode.Uri): Promise<RegExpMatchArray | null>{
        const versionFile = await fs.readFile(uri.fsPath, {encoding: consts.UE4_SOURCE_ENCODING});

        if (!versionFile){
            console.error(`Error while reading file: ${uri.fsPath}`);
            return null;
        }
        
        const regex = new RegExp(consts.RE_UE4_VERSION, "gm");      

        return versionFile.match(regex);
    }

    protected async loadMainFirstConfigCompileCommands(): Promise<boolean> {
        return await this.loadCompileCommandsFromConfig(MAIN_KEY, 0);
    }
    
    public getMainFirstConfigCompileCommands(){
        return this.getCompileCommandsAtConfigIndex(MAIN_KEY, 0);
    }

    public getMainWorkspaceCompileCommands() {
        return this.getCompileCommandsFromWorkspace(MAIN_KEY);
    }

    public getUe4WorkspaceCompileCommands() {
        return this.getCompileCommandsFromWorkspace(UE4_KEY);
    }
}
