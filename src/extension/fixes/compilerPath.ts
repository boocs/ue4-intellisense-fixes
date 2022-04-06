/*
    4.27 started adding a non escaped full compiler path in the compile commands file which VSCode doesn't like
    Will use override compiler path if extension setting compiler path strict is set to true and a extension compiler path is set
*/

import * as vscode from "vscode";

import type { ProjectUE4 } from '../../project/projectUE4';
import type { CompileCommands } from "../../project/compileCommands";
import * as consts from '../../consts';

import * as console from '../../console';


enum CompilerType {
    clang = 1
}


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

    const compilerPathOverride = getCompilerPathOverride();

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

    const match = command.match(consts.RE_COMPILE_COMMAND_COMPILER_EXE_AND_RSP_PATH);

    if(match?.length !== 3 || !match[2].startsWith("@")) {
        console.log("Error with matching compiler path and response file path.");
        return "";
    }

    if(compilerPathOverride) {  
        const newCommand =  getFixedCompilerPath(compilerPathOverride, match[2]);

        return newCommand === command ? "" : newCommand;
        
    }  

    if(match[0].startsWith(`"`)){
        return "";  // compiler path is already fixed
    }
    
    return getFixedCompilerPath(match[0], match[2]);

}

function getCompilerPathOverride() {

    
    const config = vscode.workspace.getConfiguration(consts.CONFIG_SECTION_EXTENSION_COMPILER);
    const currentExtStrictSetting = config.get<boolean>(consts.CONFIG_SETTING_STRICT_PATH);
    const currentExtCompilerPath = config.get<string>(consts.CONFIG_SETTINGS_PATH);

    if(!currentExtStrictSetting || !currentExtCompilerPath){
        console.log("Will not override compiler path in compile commands file. (Not an error)");
        return "";
    }

    console.log(`Will override compile commands' compiler paths with ${currentExtCompilerPath}`);
    return currentExtCompilerPath;  
}

function getFixedCompilerPath(compilerPath: string, responsePath: string): string {

    return `"` + compilerPath + `"` + " " + responsePath;
}

// ref: https://coderwall.com/p/0eds7q/detecting-64-bit-windows-in-node-js
function isOSWin64() {
    return process.arch === 'x64' || process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432');
}

function getNewIntellisenseMode(compilerType: CompilerType) {

    let intellisenseMode: string = "";

    if(compilerType === CompilerType.clang) {
        if(isOSWin64()){
            intellisenseMode = consts.INTELLISENSE_MODE_CLANG_X64;
        }
        else {
            intellisenseMode = consts.INTELLISENSE_MODE_CLANG_X86;
        }
    }

    return intellisenseMode;
}
