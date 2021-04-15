/**
 * Fixes invalid paths in the compile command's file
 */

import { existsSync, writeFileSync} from 'fs';
import * as path from "path";

import * as consts from '../../consts';
import * as shared from '../../shared';
import type { ProjectUE4 } from '../../project/projectUE4';

import * as console from "../../console";


export function fixResponse(project: ProjectUE4) {
    console.log("Fixing invalid paths in response files.");

    const mainCompileCommands = project.getMainFirstConfigCompileCommands();
    const responsePaths : string[] | undefined = mainCompileCommands?.getAllUsedResponsePaths();

    if(!responsePaths?.length){
        console.error("Couldn't find any response file paths.");
        return;
    }

    for(const filePath of responsePaths) {
        
        const originalResponseString = shared.readStringFromFileSync(filePath);
        if(!originalResponseString || originalResponseString.startsWith('undefined')){
            console.error("Couldn't read response file");

            if(originalResponseString?.startsWith('undefined')){
                console.error("A project reset should fix this.");
            }
            continue;
        }

        const fixedFileString = fixKnownInvalidPathsInFile(filePath, originalResponseString);

        try {
            writeFileSync(filePath, fixedFileString, consts.ENCODING_UTF_8);
        } catch (error) {
            console.error(`Problem writing fixed response file: ${error.message}.`);
            return;
        } 
    }
    
}


/**
 * @param value 
 * @returns undefined if no fixes were made
 * 
 * @logs all
 */
export function fixKnownInvalidPathsInFile(responsePath: string, originalResponseString: string): string | undefined {

    const preincludePaths = originalResponseString.match(consts.RE_PREINCLUDE_SHAREDPCH_PATH);

    if(preincludePaths?.length){
        warnInvalidPreIncludePaths(preincludePaths);
    }

    const matches = originalResponseString.match(consts.RE_COMPILE_COMMAND_INCLUDE_PATHS);

    if (!matches) {
        console.log("No includes found in response file.");
        return;
    }

    const invalidPaths = getInvalidWithValidPaths(matches);

    if (!invalidPaths.fixable.length) {
        console.log("No invalid paths returned. No fixes needed.");
        return originalResponseString;  // need to return orginal for additional fixes
    }
        
    let replacementString = originalResponseString;
    for (const invalidPath of invalidPaths.fixable) {  // now we fix and replace

        replacementString = replacementString.replace(invalidPath.invalid, invalidPath.valid);
        continue;
    }

    const parsedPath = path.parse(responsePath);
    console.log(`${parsedPath.name}: Fixed paths count(${invalidPaths.fixable.length}), Unfixed paths count(${invalidPaths.unfixable})`);
    
    return replacementString;
}


/**
 * 
 * @param outPaths 
 * @returns array of invalid/valid paths
 */
function getInvalidWithValidPaths(outPaths: string[]): { unfixable: number, fixable: { invalid: string, valid: string }[] } {

    const reBadIncPath = new RegExp(consts.RE_COMPILE_COMMAND_INC_BAD_PATH);
    const reBadReliabilityPath = new RegExp(consts.RE_COMPILE_COMMAND_RELIABILITY_BAD_PATH);

    const paths = outPaths;

    const invalidStringsObject: { unfixable: number, fixable: { invalid: string, valid: string }[] } = { unfixable: 0, fixable: [] };

    for (const key in paths) {
        if (existsSync(paths[key])) {
            continue;  // Path exist so continue.
        }

        const currentPath = paths[key];

        // Bad Inc path fix
        if (checkAndReplacePathSubstring(paths, key, { reMatch: reBadIncPath, replace: consts.REPLACEMENT_NAME_INC_TO_DEVELOPEMENT })) {
            invalidStringsObject.fixable.push({ invalid: currentPath, valid: paths[key] });
            continue;
        }

        // Bad ReliabilityHandleComponent path fix
        if (checkAndReplacePathSubstring(paths, key,
            { reMatch: reBadIncPath, replace: consts.REPLACEMENT_NAME_INC_TO_DEVELOPEMENT },
            { reMatch: reBadReliabilityPath, replace: consts.REPLACEMENT_NAME_RELIABILITY_TO_RELIABLE })) {
            invalidStringsObject.fixable.push({ invalid: currentPath, valid: paths[key] });
            continue;
        }
      
        invalidStringsObject.unfixable++;
        console.error(`Couldn't fix ${outPaths[key]} from compile commands.`);
        console.error("You may have to Build the version specified in the path before the path is fixed (e.g. The path contains Development and/or Win64)\n");
        
    }

    return invalidStringsObject;
}


/**
 *  * 
 * @param outPaths 
 * @param key of outPaths that we're trying to replace, using 'any'. shame...
 * @param fromTos reMatch: Regex for matching and replacement of the match, replace: string that replaces the match
 * 
 * @returns true if outPaths modified
 */
function checkAndReplacePathSubstring(outPaths: string[], key: any, ...fromTos: { reMatch: RegExp, replace: string }[]): boolean {

    const paths = outPaths;
    let currentPath: string = paths[key];

    for (const fromTo of fromTos) {
        currentPath = currentPath.replace(fromTo.reMatch, fromTo.replace);
    }

    if (!existsSync(currentPath)) {
        return false;
    }
    else {
        paths[key] = currentPath;
        return true;
    }

}

function warnInvalidPreIncludePaths(paths: RegExpMatchArray) {

    for(const path of paths){

        if(!existsSync(path)){
            console.log("WARNING: Intellisense preinclude path doesn't exist. Building the project should fix this.");
            console.log("WARNING: If this message persists, then do a project reset.");
        }
    }
}
