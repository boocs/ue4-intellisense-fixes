/*
    4.27 started adding a non escaped full compiler path in the compile commands file which VSCode doesn't like
    Will use override compiler path if on Windows and using clang-cl.exe
*/

import * as vscode from "vscode";

import * as fs from "fs";
import * as os from "os";

import type { ProjectUE4 } from '../../project/projectUE4';
import type { CompileCommands } from "../../project/compileCommands";
import * as consts from '../../consts';
import { CCppConfigurationJson } from "../../project/ntypes";

import * as console from '../../console';


enum CompilerType {
    clang = 1
}

export function fixCompilerPaths(project: ProjectUE4, isOptionalFixesEnabled: boolean) {

    console.log("Fixing compiler paths in compile commands.");

    const mainCompileCommands = project.getMainWorkspaceCompileCommands();

    const compileCommands = [mainCompileCommands];


    if(!isOptionalFixesEnabled){
        const ue4CompileCommands = project.getUe4WorkspaceCompileCommands();

        if(ue4CompileCommands) {
            compileCommands.push(ue4CompileCommands);
        }
        
    }

    const windowsCompilerPathOverride = getWindowsCompilerPathOverride();

    for (const compileCommand of compileCommands) {
        if (!compileCommand) { continue; }

        fixCompileCommandFile(compileCommand, windowsCompilerPathOverride);

    }

    if (windowsCompilerPathOverride) {
    
        // This didn't work in supressing auto intellisense mode changing. Once changed to clang it changes to the msvc mode
        // Leaving this for now in case this small bug is fixable later

        //setIntellisenseMode(project, getNewIntellisenseMode(CompilerType.clang));

        console.log("*** Overrode settings for Windows clang-cl ***");
    }

    console.log("Done fixing compiler paths.\n");
}

function fixCompileCommandFile(compileCommands: Map<string, CompileCommands>, compilerPathOverride: string) {

    for (const [index, compileCommand] of compileCommands) {
        
        for( const entry of compileCommand) {

            if(!entry.command) { continue;};

            const correctedCommand = getCorrectedEntryCommand(entry.command, compilerPathOverride);

            if (correctedCommand){
                compileCommand.isDirty = true;
                entry.command = correctedCommand;
            }
        }

        compileCommand.saveToFile();
        
    }
    
}

function getCorrectedEntryCommand(command: string, compilerPathOverride: string) : string {

    const match = command.match(consts.RE_COMPILE_COMMAND_COMPILER_EXE_AND_RSP_PATH);

    if(match?.length !== 3 || !match[2].startsWith("@")) {
        console.log("Error with matching compiler path and response file path.");
        return "";
    }

    if(compilerPathOverride) {  // Windows users using clang-cl
        const newCommand =  getFixedCompilerPath(compilerPathOverride, match[2]);

        return newCommand === command ? "" : newCommand;
        
    }
    else if(os.platform() === consts.PLATFORM_WINDOWS && match[0].includes(consts.COMPILER_CLANG_CL_NO_EXT)){
        // Reset windows compiler path if they no longer want to use clang-cl.exe
        // This isn't the best fix since it's not the full path but VSCode should always be able to find the correct cl.exe path
        return consts.COMPILER_MSVC + " " + match[2];  
    }
    

    if(match[0].startsWith(`"`)){
        return "";  // compiler path is already fixed
    }
    
    return getFixedCompilerPath(match[0], match[2]);

}

function getWindowsCompilerPathOverride() {

    const platform = os.platform();
	if(platform !== consts.PLATFORM_WINDOWS) {  // Windows only
        return "";
    }

    const config = vscode.workspace.getConfiguration(consts.CONFIGURATION_C_CPP);

    let compilerPath = config.get<string>(consts.CONFIG_SETTING_DEFAULT_COMPILER_PATH);

    if(compilerPath?.includes(consts.COMPILER_CLANG_CL_NO_EXT)){
        if(fs.existsSync(compilerPath)) {
            return compilerPath;
        }
        else{
            console.error("Override compiler path for clang-cl doesn't exist!");
            return "";
        }
    }
    else {
        return "";
    }
    
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
