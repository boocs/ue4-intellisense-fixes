
import * as vscode from "vscode";
import * as path from "path";

import * as consts from "../../consts";
import * as shared from "../../shared";
import * as tr from "../../text";

import type { CompileCommands } from "../../project/compileCommands";
import type { CommandObjectJson } from "../../project/ntypes";
import type { ProjectUE4 } from "../../project/projectUE4";


import * as console from "../../console";

const cancelRemainingMissingFixesCommand = "Cancel Remaining";

type ShouldWarn = "DontWarn" | "Warn";

/**
 *
 * @param project
 * @param pathToCheck check one path or check all files found in Source directory
 * @returns
 */
export async function fixMissingResponseCompileCommands(project: ProjectUE4, uriToCheck?: vscode.Uri): Promise<void | undefined> {
    console.log("Fixing missing compile command files.");

    const shouldWarn = getCurrentShouldWarn(project.mainWorkspaceFolder);

    if(shouldWarn === "DontWarn"){
        console.log("Should Warn is false. It won't prompt, about resetting project, if source file is not found in compile commands. (not an error)")
        return;
    }

    const mainCompileCommands = project.getMainWorkspaceCompileCommands();

    if (!mainCompileCommands) {
        console.log("No compile commands found!");
        return;
    }

    let hasAlreadyWarned = false;
    for (const [index, compileCommand] of mainCompileCommands) {
        
        let potentialCompileCommandsFiles: vscode.Uri[];
        if (!uriToCheck) { // Check every file since we don't specify a single uri to check
            const mainWorkspace = project.mainWorkspaceFolder;

            const relGlob = new vscode.RelativePattern(mainWorkspace, consts.GLOB_ALL_HEADERS_AND_SOURCE_FILES);
            potentialCompileCommandsFiles = await shared.findFiles(relGlob, null);
        }
        else {
            try {
                potentialCompileCommandsFiles = [uriToCheck];
            }
            catch (e) {
                console.error("Error URI parsing newly created file path. It wont be added to Intellisense. Restart VSCode to fix!");
                continue;
            }
        }

        const missingFilePaths = findMissingFilePaths(potentialCompileCommandsFiles, compileCommand);

        if (!missingFilePaths.length) {
            console.log("No missing file paths found. No fixes needed.");
            continue;
        }
        else {
            console.log(`Found ${missingFilePaths.length} missing file paths.`);

            const currentShouldWarn = getCurrentShouldWarn(project.mainWorkspaceFolder);

            if(currentShouldWarn === "DontWarn" || hasAlreadyWarned){
                continue;
            }

            const modifiedShouldWarn: ShouldWarn = await warnMissingFilesInCompileCommands(compileCommand, missingFilePaths);
            hasAlreadyWarned = true;

            if(modifiedShouldWarn === "DontWarn"){
                await setDontWarn(project.mainWorkspaceFolder);
            }
        }
    }

}

function getCurrentShouldWarn(mainWorkspaceFolder: vscode.WorkspaceFolder): ShouldWarn {
    const fixesConfig = vscode.workspace.getConfiguration(consts.CONFIG_SECTION_FIXES, mainWorkspaceFolder).get<boolean>(consts.CONFIG_SETTING_WARN_IF_MISSING_SOURCE_IN_CC);

    if(fixesConfig === undefined)
    {
        console.error(`Couldn't get Fixes Config setting: ${consts.CONFIG_SETTING_WARN_IF_MISSING_SOURCE_IN_CC}`)
        return "Warn";
    }

    return fixesConfig? "Warn" : "DontWarn";

}

async function setDontWarn(mainWorkspaceFolder: vscode.WorkspaceFolder) {
    const fixesConfig = vscode.workspace.getConfiguration(consts.CONFIG_SECTION_FIXES, mainWorkspaceFolder);

    try {
        await fixesConfig.update(consts.CONFIG_SETTING_WARN_IF_MISSING_SOURCE_IN_CC, false, vscode.ConfigurationTarget.Workspace);
    } catch (error) {
        console.error(`Couldn't set setting: ${consts.CONFIG_SETTING_WARN_IF_MISSING_SOURCE_IN_CC}`);
        if(error instanceof Error){
            console.error(`${error.message}`);
        }
        return;
    }
    
}

/**
 * Iterate through every source/header file and check if they're in the compile commands file
 * Return all file paths that aren't
 * @param sourceFiles
 * @param compileCommands
 * @returns
 */
function findMissingFilePaths(sourceFiles: vscode.Uri[], compileCommands: CompileCommands): string[] {

    let missingFilePaths: string[] = [];
    for (const uri of sourceFiles) {

        let wasFound = false;

        const normalizedSourcePath = path.normalize(uri.fsPath);
        for (const commandObject of compileCommands) {
            if (!commandObject.file) {
                continue;
            }
            const commandObjectPath = path.normalize(commandObject.file);


            if (shared.isEqualPaths(normalizedSourcePath, commandObjectPath)) {
                wasFound = true;
                break;
            }

        }

        if (!wasFound) {
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
async function warnMissingFilesInCompileCommands(outCompileCommands: CompileCommands, paths: string[]): Promise<ShouldWarn> {

    if (!outCompileCommands.length) {
        console.log("No compile commands we're found. Cannot parse command objects.");
        return "Warn";
    }

    const responseChoice = await vscode.window.showInformationMessage(
        `New Source files found!\nYou must do a "soft reset" of your project to add new source files to Intellisense.`,
        {
            detail: `Note: After resetting you may still see this message. If you do, choose "Don't Warn Again". You'll have to remember to Soft Reset your project whenever you add new source files.`,
            modal: true
        },
        tr.OK, tr.DONT_WARN_AGAIN
    );
    
    if(responseChoice === tr.DONT_WARN_AGAIN){
        return "DontWarn";
    }

    return "Warn";
      
}

async function getCommandObjectFromResponseChoice(
    commandObject: CommandObjectJson,
    responsePaths: string[],
    compileCommands: CompileCommands,
    targetPath: string): Promise<CommandObjectJson | undefined> {

    const newCommandObject: CommandObjectJson = { 
        file: commandObject.file,
        command: undefined,
        arguments: undefined,
        directory: commandObject.directory
    };

    const targetFileName = path.parse(targetPath).base;
    const responseChoice = await vscode.window.showInformationMessage(
        `Intellisense Fix\nChoose response file for new Source/Header:\n${targetFileName}\n(Resetting project can also fix this or any incorrect choice)`,
        { modal: true },
        ...convertPathsToFileNames(responsePaths),
        cancelRemainingMissingFixesCommand
    );

    if (!responseChoice) {
        return undefined;
    }

    if (responseChoice === cancelRemainingMissingFixesCommand) {
        return {
            command: cancelRemainingMissingFixesCommand
        };
    }

    if(commandObject.command){
        const commandLine = findCommandFrom(compileCommands, responseChoice);

        if (!commandLine) {
            return undefined;
        }

        newCommandObject.command = commandLine;
    }
    else if(commandObject.arguments && commandObject.arguments.length > 1){
        const args = findArgumentsFrom(compileCommands, responseChoice);

        if (!args) {
            return undefined;
        }

        newCommandObject.arguments = args;
    }
    else{
        return undefined;
    }
    

    return newCommandObject;
}

function addFileToCommandObject(commandObject: CommandObjectJson, path: string) {
    const stringifiedPath = JSON.stringify(path);
    const removedQuotesPath = stringifiedPath.replace(/^"|"$/g, '');
    commandObject.file = removedQuotesPath;
}

function convertPathsToFileNames(paths: string[]): string[] {
    let fileNames: string[] = [];

    for (const responsePath of paths) {
        fileNames.push(path.parse(responsePath).base);
    }

    return fileNames;
}

function findCommandFrom(compileCommands: CompileCommands, responseFileName: string): string {

    let command: string = "";

    for (const commandObject of compileCommands) {
        if (commandObject.command?.includes(responseFileName)) {
            command = commandObject.command;
            break;
        }
    }

    return command;
}

function findArgumentsFrom(compileCommands: CompileCommands, responseFileName: string): string[] | undefined {

    let args: string[] | undefined = [];

    for (const commandObject of compileCommands) {
        if(!commandObject.arguments){
            continue;
        }

        if (commandObject.arguments[1].includes(responseFileName)) {
            args = commandObject.arguments;
            break;
        }
    }

    return args;
}
