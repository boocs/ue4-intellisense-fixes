/**
 * Fixing the compiler not being set in all the command: args of the compile commands file.
 */

import { CompileCommands } from '../../compileCommands';

import * as console from '../../console';

const COMMAND_NO_COMPILER = `\"\"`;

// Simple check and assume any fix done by Epic will have no space at beginning of string
// This check will work on Windows 10. Not sure about other platforms.
const COMMAND_HASNT_BEEN_FIXED_CHECK = " ";


/**
 * Fixes main workspace's compileCommand file to work with VSCode
 */
export async function fixNoCompiler(outCompileCommands: CompileCommands) {
    console.log("Attempting to fix no compiler.");

        
    fixCompileCommands(outCompileCommands);

    console.log("End no compiler.\n");
}


function fixCompileCommands(outCompileCommands: CompileCommands) {
    
    let alreadyFixedCommandString : string | undefined = undefined;

    let fixedCount = 0;
    let total = 0;

    for (const compileCommand of outCompileCommands) {
        total++;

        if (compileCommand.command?.startsWith(COMMAND_HASNT_BEEN_FIXED_CHECK)) {
            compileCommand.command = COMMAND_NO_COMPILER.concat(compileCommand.command);
            fixedCount++;
        }
        else {
            if (!alreadyFixedCommandString) {
                alreadyFixedCommandString = compileCommand.command;
            }
        }
    }

    if(alreadyFixedCommandString && alreadyFixedCommandString.length > 30){
        console.log(`Compiler Commands file seems to be already fixed. The first 20 characters of a command are: ${alreadyFixedCommandString.slice(0, 29)}\n`);
    }

    if(fixedCount !== 0 && fixedCount !== total) {
        console.error("There were inconsistencies while fixing the Compile Commands file. Try resetting your UE4 project and try again.\n");
    }
    
    if( fixedCount > 0){
        outCompileCommands.isDirty = true;
    }

    
}
