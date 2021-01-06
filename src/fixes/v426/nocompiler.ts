
import * as vscode from 'vscode';

import { readJsonStringFromFile, writeJsonToFile, getGlobCompileCommandFiles, getProjectsUProjectName } from '../../shared';
import { CommandObject } from '../../ntypes';

import * as console from '../../console';

const COMMAND_NO_COMPILER = `\"\"`;


/**
 * Fixes all compileCommand files to work with VSCode (Current project + any in UE4 project)
 */
export async function fixNoCompiler() {
    console.log("Attempting to fix no compiler.");

    const uprojectName = await getProjectsUProjectName();
    const compileCommandURIs: vscode.Uri[] = await vscode.workspace.findFiles(getGlobCompileCommandFiles(uprojectName));

    for await (const uri of compileCommandURIs) {

        const nonCompatibleDatabase = await getNonCompatibleDataBase(uri.fsPath);
        if (!nonCompatibleDatabase){
            continue;
        }

        console.log(`Fixing file: ${uri.fsPath}`);
        const fixedJsonCompDatabase: CommandObject[] = await getFixedCompilationDatabase(nonCompatibleDatabase);

        console.log(`Writing: ${uri.fsPath}`);
        await writeJsonToFile(uri.fsPath, fixedJsonCompDatabase);
        
    }

    console.log("End no compiler.\n");
}


async function getFixedCompilationDatabase(compilationDatabase: readonly CommandObject[]): Promise<CommandObject[]> {
    // @todo: test with async and without
    return await Promise.all(compilationDatabase.map(async (element: CommandObject) => {
        let commandObject: CommandObject = JSON.parse(JSON.stringify(element));

        if (!commandObject?.command) {
            return commandObject;
        }

        if (commandObject.command.startsWith(" ")) {
            commandObject.command = COMMAND_NO_COMPILER.concat(commandObject.command);
        }
        else {
            // If command doesn't start with a space add one after compiler fix string. 
            // This probably won't ever hit but just in case.
            commandObject.command = COMMAND_NO_COMPILER.concat(" ", commandObject.command);
        }

        return commandObject;
    }));
}

/**
 * @param path 
 * @logs console.log If file already fixed or no command property
 */
async function getNonCompatibleDataBase(path: string) :  Promise<CommandObject[] | undefined> {
    
    const jsonCompilationDatabase: CommandObject[] | undefined = JSON.parse(await readJsonStringFromFile(path));

    const hasCompilerBug = !jsonCompilationDatabase?.[0]?.command?.startsWith(COMMAND_NO_COMPILER);
    if (!hasCompilerBug) {
        console.log(`File already fixed or no command property to check: ${path}`);
        return;
    }
    else {
        return jsonCompilationDatabase;
    }
}
