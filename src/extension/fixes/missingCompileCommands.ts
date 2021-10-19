
import * as vscode from "vscode";
import * as path from "path";

import { CONFIG_SETTING_DEFAULT_INTELLISENSE_MODE, GLOB_ALL_HEADERS_AND_SOURCE_FILES } from "../../consts";
import { isEqualPaths } from "../../shared";

import type { CompileCommands } from "../../project/compileCommands";
import type { CommandObjectJson } from "../../project/ntypes";
import type { ProjectUE4 } from "../../project/projectUE4";

import * as console from "../../console";

const cancelRemainingMissingFixesCommand = "Cancel Remaining";

/**
 *
 * @param project
 * @param pathToCheck check one path or check all files found in Source directory
 * @returns
 */
export async function fixMissingResponseCompileCommands(project: ProjectUE4, uriToCheck?: vscode.Uri): Promise<void | undefined> {
    console.log("Fixing missing compile command files.");

    const mainCompileCommands = project.getMainWorkspaceCompileCommands();

    if (!mainCompileCommands) {
        console.log("No compile commands found!");
        return;
    }

    for (const [index, compileCommand] of mainCompileCommands) {
        const allUsedResponsePaths = compileCommand?.getAllUsedResponsePaths();

        if (!allUsedResponsePaths?.length) {
            console.log("Can't fix compile commands. No response files found.");
            continue;
        }

        let potentialCompileCommandsFiles: vscode.Uri[];
        if (!uriToCheck) { // Check every file since we don't specify a single uri to check
            const mainWorkspace = project.mainWorkspaceFolder;

            const glob = new vscode.RelativePattern(mainWorkspace, GLOB_ALL_HEADERS_AND_SOURCE_FILES);
            potentialCompileCommandsFiles = await vscode.workspace.findFiles(glob);
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
        console.log(`Found ${missingFilePaths.length} missing file paths.`);

        await addFilesToCompileCommands(compileCommand, missingFilePaths, allUsedResponsePaths);

        compileCommand.saveToFile();

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


            if (isEqualPaths(normalizedSourcePath, commandObjectPath)) {
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
async function addFilesToCompileCommands(outCompileCommands: CompileCommands, paths: string[], responsePaths: string[]) {

    // check for response path length
    // if > than 1 then offer choice menu for each file added
    // find choice 'command object' to copy and use that instead of just copying first command object

    if (!outCompileCommands.length) {
        console.log("No compile commands we're found. Cannot parse command objects.");
        return;
    }

    const firstCommandObject = outCompileCommands.getCommandObjectFrom(0);

    for (const targetPath of paths) {
        let newCommandObject: CommandObjectJson | undefined = { file: undefined, command: firstCommandObject.command, directory: firstCommandObject.directory };

        addFileToCommandObject(newCommandObject, targetPath);

        if (responsePaths.length > 1) {
            newCommandObject = await getCommandObjectFromResponseChoice(newCommandObject, responsePaths, outCompileCommands, targetPath);

            if (!newCommandObject) {
                continue;
            }

            if (newCommandObject.command === cancelRemainingMissingFixesCommand) {
                // If the user selects Cancel Remaining in the prompt for asking for a
                // a missing path, we stop requesting for more missing paths by escaping
                // this loop
                break;
            }

        }

        outCompileCommands.addCommandObject(newCommandObject);
    }
}

async function getCommandObjectFromResponseChoice(
    commandObject: CommandObjectJson,
    responsePaths: string[],
    compileCommands: CompileCommands,
    targetPath: string): Promise<CommandObjectJson | undefined> {

    const newCommandObject: CommandObjectJson = { file: commandObject.file, command: undefined, directory: commandObject.directory };

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

    const commandLine = findCommandFrom(compileCommands, responseChoice);

    if (!commandLine) {
        return undefined;
    }

    newCommandObject.command = commandLine;

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
