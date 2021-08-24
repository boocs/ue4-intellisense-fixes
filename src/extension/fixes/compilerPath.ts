/*
    4.27 started adding a full compiler path in the compile commands file which VSCode doesn't like
*/

//import { CCResponseProject } from '../../project/CCResponseProject';
import type { ProjectUE4 } from '../../project/projectUE4';
import type { CompileCommands } from "../../project/compileCommands";
import * as consts from '../../consts';

import * as console from '../../console';


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
        
    for (const compileCommand of compileCommands) {
        if (!compileCommand) { continue; }

        fixCompileCommandFile(compileCommand);
    }

    console.log("Done fixing compiler paths.\n");
}

function fixCompileCommandFile(compileCommands: Map<string, CompileCommands> ) {

    for (const [index, compileCommand] of compileCommands) {
        
        for( const entry of compileCommand) {

            if(!entry.command) { continue;};

            const correctedCommand = getCorrectedEntryCommand(entry.command);

            if (correctedCommand){
                compileCommand.isDirty = true;
                entry.command = correctedCommand;
            }
        }
        
        compileCommand.saveToFile();
    }
}

function getCorrectedEntryCommand(command: string) : string {

    const match = command.match(consts.RE_COMPILE_COMMAND_COMPILER_EXE_AND_RSP_PATH);

    if (!match?.length || match[0] === command) {
       return "";
    }
    
    return match[0];
}
