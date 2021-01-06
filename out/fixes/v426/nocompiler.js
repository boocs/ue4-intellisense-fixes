"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixNoCompiler = void 0;
const vscode = require("vscode");
const shared_1 = require("../../shared");
const console = require("../../console");
const COMMAND_NO_COMPILER = `\"\"`;
/**
 * Fixes all compileCommand files to work with VSCode (Current project + any in UE4 project)
 */
async function fixNoCompiler() {
    console.log("Attempting to fix no compiler.");
    const uprojectName = await shared_1.getProjectsUProjectName();
    const compileCommandURIs = await vscode.workspace.findFiles(shared_1.getGlobCompileCommandFiles(uprojectName));
    for await (const uri of compileCommandURIs) {
        const nonCompatibleDatabase = await getNonCompatibleDataBase(uri.fsPath);
        if (!nonCompatibleDatabase) {
            continue;
        }
        console.log(`Fixing file: ${uri.fsPath}`);
        const fixedJsonCompDatabase = await getFixedCompilationDatabase(nonCompatibleDatabase);
        console.log(`Writing: ${uri.fsPath}`);
        await shared_1.writeJsonToFile(uri.fsPath, fixedJsonCompDatabase);
    }
    console.log("End no compiler.\n");
}
exports.fixNoCompiler = fixNoCompiler;
async function getFixedCompilationDatabase(compilationDatabase) {
    // @todo: test with async and without
    return await Promise.all(compilationDatabase.map(async (element) => {
        let commandObject = JSON.parse(JSON.stringify(element));
        if (!(commandObject === null || commandObject === void 0 ? void 0 : commandObject.command)) {
            return commandObject;
        }
        if (commandObject.command.startsWith(" ")) {
            commandObject.command = COMMAND_NO_COMPILER.concat(commandObject.command);
        }
        else {
            // If command doesn't start with a space add one after compiler fix string. 
            // This probably won't ever hit but just in case.
            commandObject.command = COMMAND_NO_COMPILER.concat(" ", commandObject.command);
        }
        return commandObject;
    }));
}
/**
 * @param path
 * @logs console.log If file already fixed or no command property
 */
async function getNonCompatibleDataBase(path) {
    var _a, _b;
    const jsonCompilationDatabase = JSON.parse(await shared_1.readJsonStringFromFile(path));
    const hasCompilerBug = !((_b = (_a = jsonCompilationDatabase === null || jsonCompilationDatabase === void 0 ? void 0 : jsonCompilationDatabase[0]) === null || _a === void 0 ? void 0 : _a.command) === null || _b === void 0 ? void 0 : _b.startsWith(COMMAND_NO_COMPILER));
    if (!hasCompilerBug) {
        console.log(`File already fixed or no command property to check: ${path}`);
        return;
    }
    else {
        return jsonCompilationDatabase;
    }
}
//# sourceMappingURL=nocompiler.js.map