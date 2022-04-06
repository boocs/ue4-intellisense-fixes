
import * as vscode from 'vscode';

import * as path from 'path';
import * as os from "os";

import * as fglob from "fast-glob";

import * as consts from './consts';
import * as text from './text';

import { ProjectUE4 } from './project/projectUE4';
import { CCppConfigurationJson } from './project/ntypes';

import * as console from './console';
import { TextEncoder } from 'util';
import { relative } from 'path';


/**
 * Asynchronously reads string from file
 * 
 * @param path 
 * @param encoding Default 'utf-8'
 * 
 * @returns returns undefined on failure
 * 
 * @logs console.error Error.code
 */
export async function readStringFromFile(path: string, encoding: BufferEncoding = consts.ENCODING_UTF_8): Promise<string | undefined> {

    try {
        // return await fsAsync.readFile(path, encoding) as string;
        const fileUri = vscode.Uri.file(path);
        const fileArray =  await vscode.workspace.fs.readFile(fileUri);

        return fileArray.toString();
    }
    catch (error) {
        if(error instanceof Error){ 
            console.error(`Error reading ${path}. Message: ${error.message}`);
        }
        return undefined;
    }
}

/**
 * Synchronously reads string from file
 * 
 * @param path 
 * @param encoding Default 'utf-8'
 * 
 * @returns returns undefined on failure
 * 
 * @logs console.error Error.code
 */
/* export function readStringFromFileSync(path: string, encoding: BufferEncoding = consts.ENCODING_UTF_8): string | undefined {

    try {
        
        return fsSync.readFileSync(path, encoding ) as string;
        
    }
    catch (error) {
        if(error instanceof Error){ 
            console.error(`Error reading ${path}. Message: ${error.message}`);
        }
        return undefined;
    }
} */


/**
 * Asynchronously write json to file
 * 
 * @param path 
 * @param data Any data except string will use JSON.stringify
 * @param encoding Default 'utf-8'
 * @logs console.error Error.code
 */
export async function writeJsonOrStringToFile(path: string, data: any, encoding: BufferEncoding = consts.ENCODING_UTF_8,
    spacing: number = consts.JSON_SPACING) {
    try {
        const writeData = typeof data === "string" ? data : JSON.stringify(data, undefined, spacing);
        //await fsAsync.writeFile(path, writeData, encoding);
        const textEnc = new TextEncoder();
        const fileBuffer = Uint8Array.from(textEnc.encode(writeData));
        await vscode.workspace.fs.writeFile(vscode.Uri.file(path), fileBuffer);
        return;
    }
    catch (error) {
        if(error instanceof Error){
            console.error(`Error writing json file. Message: ${error.message}`);
        }
        return;
    }

}


/**
 * Synchronously write json to file
 * 
 * @param path 
 * @param data Any data except string will use JSON.stringify
 * @param encoding Default 'utf-8' 
 * @logs console.error Error.code
 */
/* export function writeJsonToFileSync(path: string, data: any, encoding: BufferEncoding = consts.ENCODING_UTF_8,
    spacing: number = consts.JSON_SPACING) {
    try {
        const writeData = typeof data === "string" ? data : JSON.stringify(data, undefined, spacing);
        fsSync.writeFileSync(path, writeData, encoding);
    }
    catch (error) {
        if(error instanceof Error){
            console.error(`Error writing json file. Message: ${error.message}`);
        }

        return;
    }

} */


/**
 * For when we first parse outside data. 
 * @param data
 * @returns undefined on error
 * @logs console.error
 */
export function jsonParseSafe(data: string): any | undefined {
    try {
        return JSON.parse(data);
    } catch (error) {

        if(error instanceof Error){
            console.error(`JSON string was malformed and can't be parsed. Message: ${error.message}`);
        }

        return undefined;
    }
}


/**
 * Defaults to univeral every compile command file
 * 
 * @param nameSuffix compileCommands_nameSuffix.json
 */
export function createGlobCompileCommandFileName(nameSuffix: string = "*"): string {
    return `compileCommands_${nameSuffix}.json`;
}


/**
 * @param workspaceFolder null will find files in all workspaces
 * @param globFilename This param will always be appended with ".vscode/"
 * @log console.log Can't find files or workspace undefined
 * 
 */
export async function findVSCodeFolderFiles(workspaceFolder: vscode.WorkspaceFolder | undefined | null,
    globFilename: string): Promise<vscode.Uri[] | undefined> {
    if (!workspaceFolder) {
        console.log("Workspace undefined. Won't find files in .vscode folder.");
        return;
    }

    const glob = `.vscode/${globFilename}`;
    const include = !workspaceFolder ? glob : new vscode.RelativePattern(workspaceFolder, glob);
    
    let foundFiles: vscode.Uri[] = [];
    try {
        foundFiles = await findFiles(include, null);
    }
    catch (error) {
        console.error(`Error finding ${globFilename}, ${workspaceFolder?.name} workspace, with findVSCodeFolderFiles()`);
        return;
    }

    if (!foundFiles?.length) {
        console.log(`Couldn't find files in ${workspaceFolder?.name} workspace's .vscode folder with glob: ${glob}`);
        return;
    }

    return foundFiles;
}


export function isEqualPaths(path1: string, path2: string): boolean {
    try {
        return !path.relative(path1, path2);
    }
    catch (error) {
        console.error(`Error with path.relative: ${path1} === ${path2}`);
        return false;
    }
}

export function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 
 * @param regExpString Format: "re/flags" : The '/' is required but flags are optional
 */
export function createRegExpFrom(regExpString: string): RegExp {

    // Build regex and regex flags from string
    const reSeparatedArray = regExpString.split(consts.RE_SEPARATOR);
    const regexFlags = regExpString.endsWith(consts.RE_SEPARATOR) ? undefined : reSeparatedArray.pop();
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


// These next two functions get stuck here. Didn't like anywhere else.
export function setIntellisenseMode(project: ProjectUE4, mode: string) {
    const workSpacesCCppConfigs = getWorkspacesCCppConfigs(project);
    
    if (!workSpacesCCppConfigs) {
        console.error("Error getting workspaces. The intellisenseMode won't be changed.");
        return;
    }
    
    for (const key in workSpacesCCppConfigs){
        for (const config of workSpacesCCppConfigs[key]) {
            config.intelliSenseMode = mode;
            console.log(`This extension set ${key} workspace c_cpp_properties.json's intellisenseMode to ${mode}`);
        }
                
    }
}

// Copied from another fix... Should put this in a single file...
/**
 * @param project 
 * @logs error
 */
 export function getWorkspacesCCppConfigs(project: ProjectUE4): Record<string, CCppConfigurationJson[]> | undefined {
    const mainCCppPropertiesConfiguration = project.getCCppConfigurationsFromWorkspace(project.mainWorkspaceKey);
    if (!mainCCppPropertiesConfiguration) {
        console.error("Couldn't get Main c_cpp_properties.json's first configuration.");
        return;
    }

    const ue4CCppPropertiesConfiguration = project.getCCppConfigurationsFromWorkspace(project.ue4WorkspaceKey);
    if (!ue4CCppPropertiesConfiguration) {
        console.error("Couldn't get UE4 c_cpp_properties.json's first configuration.");
        return;
    }

    const workspaces: Record<string, CCppConfigurationJson[]> = {};
    workspaces[project.mainWorkspaceKey] = mainCCppPropertiesConfiguration;
    workspaces[project.ue4WorkspaceKey] = ue4CCppPropertiesConfiguration;

    return workspaces;
}

// ref: https://stackoverflow.com/questions/65146751/detecting-apple-silicon-mac-in-javascript
export function isMacM1(isLog = true) : boolean {

    if(isLog) {
        console.log(`Cpu: ${os.cpus()[0].model}`);
    }

    return os.cpus()[0].model.includes(consts.CPUID_MACM1);
}


// This is a workaround because the vscode api findFiles function sometimes doesn't work
// For some people it almost never works.
export async function findFiles(include: vscode.GlobPattern, exclude: vscode.GlobPattern | null | undefined = null, maxResults?: number | undefined) : Promise<vscode.Uri[]> {

    const searchPaths: string[] = [];
    let pattern: string = "";

    if(typeof include === "string"){
        if(!vscode.workspace.workspaceFolders){
            console.error("No workspaceFolders found while trying to findFiles(shared).");
            return []
        }

        pattern = include;

        for(const workspaceFolder of vscode.workspace.workspaceFolders){
            const convertedPath = workspaceFolder.uri.fsPath.split(path.sep).join(path.posix.sep);
            searchPaths.push(convertedPath);
        }
    }
    else{
        const relPattern: vscode.RelativePattern = include;
        
        pattern = relPattern.pattern;
        // ref: https://stackoverflow.com/questions/53799385/how-can-i-convert-a-windows-path-to-posix-path-using-node-path
        const convertedPath = relPattern.base.split(path.sep).join(path.posix.sep);
        searchPaths.push(convertedPath);
    }

    const fileUris: vscode.Uri[] = [];
    for(const searchPath of searchPaths){
        //console.log(`Searching... pattern:(${pattern})  search path:(${searchPath})`)
        const pathSuffixes: string[] = await fglob(pattern, {cwd: searchPath});

        if(!pathSuffixes.length){
            console.log("Searching with fast-glob found nothing. (Sometimes isn't bug)");
            continue;
        }
        fileUris.push(...getUrisFromBasePathAndSuffixes(searchPath, pathSuffixes));
    }
    
    return fileUris;
}

function getUrisFromBasePathAndSuffixes(base: string, pathSuffixes: string[]): vscode.Uri[]{

    const uris: vscode.Uri[] = [];
    for(const pathSuffix of pathSuffixes){
        const fullPath = path.join(base, pathSuffix);
        //console.log(`Created path from search: ${fullPath}`)
        const newUri = vscode.Uri.file(fullPath)
        //console.log(`Uri created. Has path: ${newUri.fsPath}`)
        uris.push(newUri);
        
    }

    return uris;
}