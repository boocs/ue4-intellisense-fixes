"use strict";
/**
 * Fixing the compiler not being set in all the command: args of the compile commands file.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixNoCompiler = void 0;
const console = require("../../console");
const COMMAND_NO_COMPILER = `\"\"`;
// Simple check and assume any fix done by Epic will have no space at beginning of string
// This check will work on Windows 10. Not sure about other platforms.
const COMMAND_HASNT_BEEN_FIXED_CHECK = " ";
/**
 * Fixes main workspace's compileCommand file to work with VSCode
 */
async function fixNoCompiler(outCompileCommands) {
    console.log("Attempting to fix no compiler.");
    fixCompileCommands(outCompileCommands);
    console.log("End no compiler.\n");
}
exports.fixNoCompiler = fixNoCompiler;
function fixCompileCommands(outCompileCommands) {
    var _a;
    let alreadyFixedCommandString = undefined;
    let fixedCount = 0;
    let total = 0;
    for (const compileCommand of outCompileCommands) {
        total++;
        if ((_a = compileCommand.command) === null || _a === void 0 ? void 0 : _a.startsWith(COMMAND_HASNT_BEEN_FIXED_CHECK)) {
            compileCommand.command = COMMAND_NO_COMPILER.concat(compileCommand.command);
            fixedCount++;
        }
        else {
            if (!alreadyFixedCommandString) {
                alreadyFixedCommandString = compileCommand.command;
            }
        }
    }
    if (alreadyFixedCommandString && alreadyFixedCommandString.length > 30) {
        console.log(`Compiler Commands file seems to be already fixed. The first 20 characters of a command are: ${alreadyFixedCommandString.slice(0, 29)}\n`);
    }
    if (fixedCount !== 0 && fixedCount !== total) {
        console.error("There were inconsistencies while fixing the Compile Commands file. Try resetting your UE4 project and try again.\n");
    }
    if (fixedCount > 0) {
        outCompileCommands.isDirty = true;
    }
}
//# sourceMappingURL=noCompiler.js.map