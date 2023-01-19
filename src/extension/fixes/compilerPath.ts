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

    if(!compilerPathOverride){
        console.error("No compiler path override found. Not fixing compiler path!");
        return;
    }

    
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

            if(!entry.command && !entry.arguments) { 
                continue;
            };

            
            if(entry.command){
                const correctedCommand = getCorrectedEntryCommand(entry.command, compilerPathOverride);

                if (correctedCommand){
                    compileCommand.isDirty = true;
                    entry.command = correctedCommand;
                }
            }
            else if(entry.arguments){
                entry.arguments[0] = compilerPathOverride;
                compileCommand.isDirty = true;
            }
            

            if(!hasLogged) {
                hasLogged = true;
                const logInfo = entry.arguments? entry.arguments[0] : entry.command;
                console.log("Below is the compile commands first entry command. (WARNING) If getting errors and the compiler path is unexpected reset your UE project.");
                console.log(`command/arguments[0]: ${logInfo}`);
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

    let config = vscode.workspace.getConfiguration(consts.CONFIG_SECTION_EXTENSION_COMPILER);
    const compilePathIsProjectSpecific = config.get<boolean>(consts.CONFIG_SETTINGS_PATH_IS_PROJECT_SPECIFIC, false);

    const isCompilePathGlobal = compilePathIsProjectSpecific ? false : true;  // true means global, false means project(workspace)
    await checkAndRemoveCompilePathSetting(config, isCompilePathGlobal);  // remove project path if global, remove global path if project specific

    config = vscode.workspace.getConfiguration(consts.CONFIG_SECTION_EXTENSION_COMPILER); // need updated config after check and remove function above
    const currentExtCompilerPath = config.get<string>(consts.CONFIG_SETTINGS_PATH);
    const compileCommandCompilerPath = getCompileCommandsCompilerPath(project);

    if(!currentExtCompilerPath){
        

        if(!compileCommandCompilerPath){
            console.error("Couldn't set extension's compile path setting because compiler is null!");
            return "";
        }

        try {
            await updatePathSetting(config, compileCommandCompilerPath, isCompilePathGlobal);
            //await config.update(consts.CONFIG_SETTINGS_PATH, compileCommandCompilerPath, isCompilePathGlobal)
        } catch (error) {
            console.error("Couldn't set extension's compile path setting!")
            return ""
        }
        return compileCommandCompilerPath;
    }
    else if(compileCommandCompilerPath && compileCommandCompilerPath !== currentExtCompilerPath){
        const responseChoice = await vscode.window.showInformationMessage(
            `Compiler path choice!\n\n1:  ${compileCommandCompilerPath}\n2:  ${currentExtCompilerPath}\n\nDo you want to use the 1st or 2nd compiler path?`,
            { modal: true },
            "1", "2"
        );

        
        if(responseChoice === "2"){
            return currentExtCompilerPath;
        }
        else{
            await updatePathSetting(config, compileCommandCompilerPath, isCompilePathGlobal);
            //await config.update(consts.CONFIG_SETTINGS_PATH, compileCommandCompilerPath, isCompilePathGlobal)
            return compileCommandCompilerPath;
        }
    }

    return currentExtCompilerPath;  
}


function getFixedCompilerPath(compilerPath: string, responsePath: string): string {

    return `"` + compilerPath + `"` + " " + responsePath;
}


async function checkAndRemoveCompilePathSetting(config: vscode.WorkspaceConfiguration, isCompilerPathGlobal: boolean) {

    if(isCompilerPathGlobal){
        await updatePathSetting(config, undefined, false);
        //await config.update(consts.CONFIG_SETTINGS_PATH, undefined, false);
    }
    else{
        await updatePathSetting(config, undefined, true);
        //await config.update(consts.CONFIG_SETTINGS_PATH, undefined, true);
    }
}

async function updatePathSetting(config: vscode.WorkspaceConfiguration, path: string | undefined, isGlobal: boolean, section: string = consts.CONFIG_SETTINGS_PATH) {
    try {
        await config.update(section, path, isGlobal);
    } catch (e) {
        let errMessage = ""
        if(e instanceof Error){
            errMessage = e.message;
        }

        console.error(`Error trying to update path setting!\n${errMessage}`)
    }
}
