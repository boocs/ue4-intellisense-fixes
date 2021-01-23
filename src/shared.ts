
import * as path from 'path';
import { promises as fs } from 'fs';

import * as vscode from 'vscode';

import * as consts from './consts';
import * as text from './text';
import * as console from './console';


/**
 * @param path 
 * @param encoding Default 'utf-8'
 * 
 * @returns returns undefined on failure
 * 
 * @logs console.error Error.code
 */
export async function readJsonStringFromFile<T>(path: string, encoding: string = consts.ENCODING_UTF_8) : Promise<string> {
    
    try {
        return await fs.readFile(path, encoding) as string;
    }
    catch(error) {
        console.error(`Error reading ${path}. Message: ${error.message}; Reason: ${error.code}`);
        return "";
    }
}


/**
 * @param path 
 * @param data Any data except string will use JSON.stringify
 * @param encoding Default 'utf-8'
 * @returns true on success and undefined on failure
 * 
 * @logs console.error Error.code
 */
export async function writeJsonToFile(path: string, data: any, encoding: string = consts.ENCODING_UTF_8,
							   spacing: number = consts.JSON_SPACING)
{
    try {
        const writeData = typeof data === "string" ? data : JSON.stringify(data, undefined, spacing);
        await fs.writeFile(path, writeData, encoding);
        return;
    }
    catch(error) {
        console.error(`Error writing json file. Message: ${error.message}; Reason: ${error.code}`);
        return;
    }
	
}

/**
 * For when we first parse outside data. Unneeded after since we'd want it to throw exceptions on our code
 * @param data
 * @returns undefined on error
 * @logs console.error
 */
export function jsonParseSafe(data: string) : any | undefined {
    try {
        return JSON.parse(data);
    } catch (error) {
        console.error(`JSON string was malformed and can't be parsed. Message: ${error.message}`);
        return undefined;
    }
}


/**
 * Defaults to univeral every compile command file
 * 
 * @param nameSuffix compileCommands_nameSuffix.json
 */
export function createGlobCompileCommandFileName(nameSuffix: string = "*") : string {
	return  `compileCommands_${nameSuffix}.json`;
}


/** 
 * @returns If not valid vscode.WorkspaceFolder, returns undefined
 * @logs If can't find workspace.
 */
export function getUE4WorkspaceFolder() : vscode.WorkspaceFolder | undefined {

    const ue4Workspace = vscode.workspace.workspaceFolders?.find( workspaceFolder => {
        return workspaceFolder.name === consts.WORKSPACE_FOLDER_NAME_UE4;
    });
    
    if (!ue4Workspace){
        console.log("Couldn't find a UE4 workspace.");
        return;
    }

    return ue4Workspace;
}


export function getUE4Path() :string {
    const ue4WorkspaceFolder = vscode.workspace.workspaceFolders?.find( workspaceFolder =>{
        return workspaceFolder.name === consts.WORKSPACE_FOLDER_NAME_UE4;
    });

    return !!ue4WorkspaceFolder ? ue4WorkspaceFolder.uri.fsPath : "";
}

/**
 * @param excludeUE4
 * 
 * @logs console.error When no uproject files found.
 * @todo Can exclude pattern work somehow to filter out ue4 folder? This function still works with alternate exclude using filter.
 */
export async function getUProjectFiles(excludeUE4: boolean = true) : Promise<vscode.Uri[] | undefined> {

    let uprojectFiles;
    try{
        uprojectFiles = await vscode.workspace.findFiles(consts.GLOB_ANY_UPROJECT_IN_TOPLEVEL);
    }
    catch{
        console.error("Error finding uproject files in GetUprojectFiles()");
        return;
    }

    if (!uprojectFiles?.length){
        console.error("No uproject files found.");
        return;
    }

    if (excludeUE4){
        const ue4WorkspaceFolder = getUE4WorkspaceFolder();
        if (!ue4WorkspaceFolder){
            return;
        }

        try{
            uprojectFiles = await Promise.all( uprojectFiles.filter( uri => { return !uri.fsPath.includes(ue4WorkspaceFolder.uri.fsPath); }));
        }
        catch(error){
            console.error("Error filtering uproject files in GetUProjectFiles(): (exclude UE4).");
            return;
        }
    }
    
    return uprojectFiles;    
}

/**
 * We assume a project has only 1 uproject file and return it's name (excluding the UE4 path). Empty string is returned otherwise.
 * 
 * @logs console.error No uproject file found or multiple uproject files found
 * @returns empty string on error
 */
export async function getProjectsUProjectName() : Promise<string> {
    const uprojectFiles = await getUProjectFiles();

    if (!uprojectFiles?.length || uprojectFiles.length > 1){
        console.error(`Error in number of uproject files found: ${uprojectFiles?.length}`);
        return "";
    }

    return path.parse(uprojectFiles[0].fsPath).name;
}

/**
 * @param workspaceFolder null will find files in all workspaces
 * @param globFilename This param will always be appended with ".vscode/"
 * @log console.log Can't find files or workspace undefined
 * 
 */
export async function findVSCodeFolderFiles(workspaceFolder: vscode.WorkspaceFolder | undefined | null,
                                            globFilename: string) : Promise<vscode.Uri[] | undefined> {
    if (workspaceFolder === undefined){
        console.log("Workspace undefined. Won't find files in .vscode folder.");
        return;
    }

    const glob = `.vscode/${globFilename}`;
    const include = !workspaceFolder ? glob : new vscode.RelativePattern( workspaceFolder, glob);

    let foundFiles;
    try {
        foundFiles = await vscode.workspace.findFiles(include);
    }
    catch(error){
        console.error(`Error finding ${globFilename}, ${workspaceFolder?.name} workspace, with findVSCodeFolderFiles()`);
        return;
    }

    if (!foundFiles?.length){
        console.log(`Couldn't find files in ${workspaceFolder?.name} workspace's .vscode folder with glob: ${glob}`);
        return;
    }

    return foundFiles;
}


/**
 * @returns Note: Can return empty string
 */
export async function getProjectsUProjectPath() : Promise<string> {
    const uprojectFiles = await getUProjectFiles();

    if (!uprojectFiles?.length || uprojectFiles.length > 1){
        console.error(`Error in number of uproject file paths: ${uprojectFiles?.length}`);
        return "";
    }

    return path.parse(uprojectFiles[0].fsPath).dir;
}


/**
 * @returns undefined if nothing could be found
 * @logs If noworkspaces found or main workspace not found
 */
export async function getUE4ProjectsMainWorkspace() : Promise<vscode.WorkspaceFolder | undefined> {
    const mainWorkspacePath = await getProjectsUProjectPath();

    if (!vscode.workspace.workspaceFolders?.length){
        console.log("No workspaces found in getUE4ProjectsMainWorkspace");
        return;
    }

    const workspace = vscode.workspace.workspaceFolders.find( workspaceFolder =>{
        return path.normalize(workspaceFolder.uri.fsPath) === path.normalize(mainWorkspacePath);
    });

    if(!workspace){
        console.error("Main workspace not found in getUE4ProjectsMainWorkspace");
        return;
    }

    return workspace;
}


export function isEqualPaths( path1: string, path2: string) : boolean {
    try {
        return !path.relative(path1, path2); 
    }
    catch (error) {
        console.error(`Error with path.relative: ${path1} === ${path2}`);
        return false;   
    }
}

export function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}


export function getRegExp(regExpString: string): RegExp {

    // Build regex and regex flags from string
    const reSeparatedArray = regExpString.split(consts.RE_SEPARATOR);
    const regexFlags = reSeparatedArray.pop();
    const regexString = reSeparatedArray.join(consts.RE_SEPARATOR);

    try {
        return new RegExp(regexString, regexFlags);
    }
    catch (error) {
        console.error(`RegExp was invalid: reString: ${regexString} , reFlags: ${regexFlags}`);

        vscode.window.showErrorMessage(text.INVALID_REGEX, text.OK);
        throw error;
    }
}