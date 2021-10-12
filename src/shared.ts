
import * as vscode from 'vscode';

import * as path from 'path';
import { promises as fsAsync } from 'fs';
import * as fsSync from "fs";

import * as consts from './consts';
import * as text from './text';

import * as console from './console';


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
export async function readStringFromFile(path: string, encoding: string = consts.ENCODING_UTF_8): Promise<string | undefined> {

    try {
        return await fsAsync.readFile(path, encoding) as string;
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
export function readStringFromFileSync(path: string, encoding: string = consts.ENCODING_UTF_8): string | undefined {

    try {
        return fsSync.readFileSync(path, encoding) as string;
    }
    catch (error) {
        if(error instanceof Error){ 
            console.error(`Error reading ${path}. Message: ${error.message}`);
        }
        return undefined;
    }
}


/**
 * Asynchronously write json to file
 * 
 * @param path 
 * @param data Any data except string will use JSON.stringify
 * @param encoding Default 'utf-8'
 * @logs console.error Error.code
 */
export async function writeJsonToFile(path: string, data: any, encoding: string = consts.ENCODING_UTF_8,
    spacing: number = consts.JSON_SPACING) {
    try {
        const writeData = typeof data === "string" ? data : JSON.stringify(data, undefined, spacing);
        await fsAsync.writeFile(path, writeData, encoding);
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
export function writeJsonToFileSync(path: string, data: any, encoding: string = consts.ENCODING_UTF_8,
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

}


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
    if (workspaceFolder === undefined) {
        console.log("Workspace undefined. Won't find files in .vscode folder.");
        return;
    }

    const glob = `.vscode/${globFilename}`;
    const include = !workspaceFolder ? glob : new vscode.RelativePattern(workspaceFolder, glob);

    let foundFiles;
    try {
        foundFiles = await vscode.workspace.findFiles(include);
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
