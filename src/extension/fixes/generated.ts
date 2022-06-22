// Warn if generated.h files are not created
// Warn if generated.h files path isn't in rsp files

import * as vscode from "vscode";

import type { ProjectUE4 } from "../../project/projectUE4";

import { CompileCommands } from "../../project/compileCommands";
import * as shared from "../../shared";

import * as console from "../../console";


const GLOB_UE_EDITOR_GENERATED = "Intermediate/Build/**/UnrealEditor/Inc/**/*.generated.h"
const GLOB_UE4_EDITOR_GENERATED = "Intermediate/Build/**/UE4Editor/Inc/**/*.generated.h"

const REGEX_UE_EDITOR_GENERATED = /(?<!Engine)[\/|\\]Intermediate[\/|\\]Build[\/|\\](?:\w+[\/|\\])+(?:Unreal|UE4)Editor[\/|\\]Inc/gm


export async function fixGenerated(project: ProjectUE4) : Promise<void> {
    console.log("Fixing *.generated.h files!");

    const mainWorkspace = project.mainWorkspaceFolder;
    const relPatternUEEditor = new vscode.RelativePattern(mainWorkspace, GLOB_UE_EDITOR_GENERATED);
    const relPatternUE4Editor = new vscode.RelativePattern(mainWorkspace, GLOB_UE4_EDITOR_GENERATED);

    const unrealEditorGeneratedFiles = await shared.findFiles(relPatternUEEditor);
    const ue4EditorGeneratedFiles = await shared.findFiles(relPatternUE4Editor);

    if(!unrealEditorGeneratedFiles.length && !ue4EditorGeneratedFiles){
        console.error(`No *.generated.h files found!`
            + "\n*** Build with the 'Editor' suffix configuration e.g. 'MyProjectNameEditor (platform) Development Build'."
            + "\n*** If it doesn't work try a Rebuild e.g. 'MyProjectNameEditor (platform) Development Rebuild'");
        return;  // We don't check for the next bug test if this isn't fixed first
    }
    else {
        console.log("Correct *.generated.h files are found! Note: This extension doesn't test if all *.generated.h files have been created.");
        console.log("For Intellisense, you'll need to Build any newly created project files with the 'Editor' suffix config (e.g. MyProjectNameEditor (platform) Development Build).")
    }

    const mainCompileCommands = project.getMainWorkspaceCompileCommands();
    const ueCompileCommands = project.getUe4WorkspaceCompileCommands();

    const compileCommands: Map<string, CompileCommands>[] = [];

    if(mainCompileCommands){
        compileCommands.push(mainCompileCommands);
    }

    if(ueCompileCommands){
        compileCommands.push(ueCompileCommands);
    }

    const uniqueResponsePaths = getUniqueResponsePathsFromCompileCommands(compileCommands);
    if(await hasRegexInAllFiles(REGEX_UE_EDITOR_GENERATED, uniqueResponsePaths)) {
        console.log("All response files have the correct *.generated.h path!");
    }
        
    return;

}


function getUniqueResponsePathsFromCompileCommands(compileCommands: Map<string, CompileCommands>[]) {
    
    const allResponsePaths : string[] = [];
    
    for(const commands of compileCommands){
        for (let [key, value] of commands) {
            const rspPaths = value.getAllUsedResponsePaths()
            if(rspPaths){
                allResponsePaths.push(...rspPaths);
            }
        }
    }

    return [...new Set<string>(allResponsePaths)];
}

async function hasRegexInAllFiles(regExp: RegExp, paths: string[]) : Promise<boolean>{
    for(const path of paths){
        const fileString = await shared.readStringFromFile(path);

        if(!fileString){
            console.error(`File was empty or nonexistant: ${path}`)
            continue;
        }
        
        const match = fileString.match(regExp);

        if(!match?.length){
            console.error(`No match found for RegExp(${regExp.source}) on file: ${path}`);
            console.error("You must refresh your project by Generating Project files!");
            console.error("You can do this with VSCode->Run/Debug(MS C# Ext required), right-clicking project's *.uproject file, or in the Unreal Engine menus.")
            return false;
        }
    }

    return true;
}