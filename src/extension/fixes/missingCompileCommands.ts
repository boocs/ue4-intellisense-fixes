
import * as vscode from "vscode";
import * as path from "path";

import { GLOB_ALL_HEADERS_AND_SOURCE_FILES, MAIN_WORKSPACE_SOURCE_DIRECTORY_NAME} from "../../consts";
import { isEqualPaths } from "../../shared";

import type { CompileCommands } from "../../project/compileCommands";
import type { CommandObjectJson } from "../../project/ntypes";
import type { ProjectUE4 } from "../../project/projectUE4";

import * as console from "../../console";


export async function fixMissingResponseCompileCommands(project: ProjectUE4): Promise<void | undefined> {
    console.log("Fixing missing compile command files.");
    
    const mainCompileCommands = project.getMainFirstConfigCompileCommands();

    if(!mainCompileCommands?.length){
        return;
    }

    const allUsedResponsePaths = mainCompileCommands?.getAllUsedResponsePaths();

    if(!allUsedResponsePaths || allUsedResponsePaths.length > 1){
        if(!allUsedResponsePaths){
            console.log("Can't fix compile commands. No response files found.");
        }
        else {
            console.log("Can't fix compile commands. More than 1 response file found.");
        }
        return;
    }

    const mainWorkspace = project.mainWorkspaceFolder;

    const mainSourcePath = path.join(mainWorkspace.uri.fsPath, MAIN_WORKSPACE_SOURCE_DIRECTORY_NAME);

    const glob = new vscode.RelativePattern(mainSourcePath, GLOB_ALL_HEADERS_AND_SOURCE_FILES);
    const potentialCompileCommandsFiles = await vscode.workspace.findFiles(glob);

    const missingFilePaths = findMissingFilePaths(potentialCompileCommandsFiles, mainCompileCommands);

    if(!missingFilePaths.length){
        console.log("No missing file paths found. No fixes needed.");
        return;
    }
    console.log(`Found ${missingFilePaths.length} missing file paths.`);

    duplicateFirstCommandObjectAndAddToCompileCommands(mainCompileCommands, missingFilePaths);

    mainCompileCommands.saveToFile();

    return;

}

function findMissingFilePaths(sourceFiles: vscode.Uri[], compileCommands: CompileCommands) : string[] {

    let missingFilePaths: string[] = [];
    for( const uri of sourceFiles){

        let wasFound = false;

        const normalizedSourcePath = path.normalize(uri.fsPath);
        for(const commandObject of compileCommands){
            if(!commandObject.file){
                continue;
            }
            const commandObjectPath = path.normalize(commandObject.file);
            

            if(isEqualPaths(normalizedSourcePath, commandObjectPath)){
                wasFound = true;
                break;
            }
                
        }

        if(!wasFound){
            missingFilePaths.push(normalizedSourcePath);
        }
    }

    return missingFilePaths;
}

/**
 * Duplicates the first Command Object and adds duplicated + new path Command Object to the compile commands
 * @param outCompileCommands the compile command we're modifying
 * @param paths paths that need to be added
 */
function duplicateFirstCommandObjectAndAddToCompileCommands(outCompileCommands: CompileCommands, paths: string[]) {
    if(!outCompileCommands.length){
        console.log("Not compile commands we're found. Cannot duplicate.");
        return;
    }

    const firstCommandObject = outCompileCommands.getCommandObjectFrom(0);

    for(const path of paths){
        let duplicateCommandObject: CommandObjectJson = {file: undefined, command: firstCommandObject.command, directory: firstCommandObject.directory};
        
        const stringifiedPath = JSON.stringify(path);
        const removedQuotesPath = stringifiedPath.replace(/^"|"$/g, '');
        duplicateCommandObject.file = removedQuotesPath;

        outCompileCommands.addCommandObject(duplicateCommandObject);
    }
}
