/*
    4.27 started adding a non escaped full compiler path in the compile commands file which VSCode doesn't like
    Will use override compiler path if extension setting compiler path strict is set to true and a extension compiler path is set
*/

import * as vscode from "vscode";

import type { ProjectUE4 } from '../../project/projectUE4';
import type { CompileCommands } from "../../project/compileCommands";
import * as consts from '../../consts';
import {getCompileCommandsCompilerPath} from "../../shared"

import * as console from '../../console';


export async function fixCompilerPaths(project: ProjectUE4, isOptionalFixesEnabled: boolean) {

    console.log("Fixing compiler paths in compile commands.");

    const mainCompileCommands = project.getMainWorkspaceCompileCommands();

    const compileCommands = [mainCompileCommands];
    

    if(!isOptionalFixesEnabled){
        const ue4CompileCommands = project.getUe4WorkspaceCompileCommands();

        if(ue4CompileCommands) {
            compileCommands.push(ue4CompileCommands);
        }
        
    }

    const compilerPathOverride = await getCompilerPathOverride(project);

    for (const compileCommand of compileCommands) {
        if (!compileCommand) { continue; }

        await fixCompileCommandFile(compileCommand, compilerPathOverride);

    }

    console.log("Done fixing compiler paths.\n");
}

async function fixCompileCommandFile(compileCommands: Map<string, CompileCommands>, compilerPathOverride: string) {

    let hasLogged = false;

    for (const [index, compileCommand] of compileCommands) {
        
        for( const entry of compileCommand) {

            if(!entry.command) { continue;};

            

            const correctedCommand = getCorrectedEntryCommand(entry.command, compilerPathOverride);

            if (correctedCommand){
                compileCommand.isDirty = true;
                entry.command = correctedCommand;
            }

            if(!hasLogged) {
                hasLogged = true;
                console.log("Below is the compile commands first entry command. (WARNING) If getting errors and the compiler path is unexpected reset your UE project.");
                console.log(`command: ${entry.command}`);
            }

        }
        hasLogged = false; // log first compiler path for each file;
        await compileCommand.saveToFile();
        
    }
    
}

function getCorrectedEntryCommand(command: string, compilerPathOverride: string) : string {

    if(!compilerPathOverride){
        console.error("getCorrectedEntryCommand was passed an empty compilerPathOverride!")
        return "";
    }

    const match = command.match(consts.RE_COMPILE_COMMAND_COMPILER_EXE_AND_RSP_PATH);

    if(match?.length !== 3 || !match[2].startsWith("@")) {
        console.log("Error with matching compiler path and response file path.");
        return "";
    }

    const newCommand =  getFixedCompilerPath(compilerPathOverride, match[2]);

    return newCommand === command ? "" : newCommand;
        
}

async function getCompilerPathOverride(project: ProjectUE4): Promise<string> {

    const config = vscode.workspace.getConfiguration(consts.CONFIG_SECTION_EXTENSION_COMPILER);
    const currentExtCompilerPath = config.get<string>(consts.CONFIG_SETTINGS_PATH);

    if(!currentExtCompilerPath){
        const compileCommandCompilerPath = getCompileCommandsCompilerPath(project);

        if(!compileCommandCompilerPath){
            console.error("Couldn't set extension's compile path setting because compiler is null!");
            return "";
        }

        try {
            await config.update(consts.CONFIG_SETTINGS_PATH, compileCommandCompilerPath, true)
        } catch (error) {
            console.error("Couldn't set extension's compile path setting!")
            return ""
        }
        return compileCommandCompilerPath;
    }

    console.log(`Will override compile commands' compiler paths with ${currentExtCompilerPath}`);
    return currentExtCompilerPath;  
}


function getFixedCompilerPath(compilerPath: string, responsePath: string): string {

    return `"` + compilerPath + `"` + " " + responsePath;
}
