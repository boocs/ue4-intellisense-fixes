"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompileCommands = exports.RE_RESPONSE_FILE_PATH = void 0;
const shared = require("../shared");
const consts_1 = require("../consts");
const console = require("../console");
exports.RE_RESPONSE_FILE_PATH = "(?<= @\\\").*.rsp";
class CompileCommands {
    /**
     * @param path to compile commands file
     * @throws Error
     */
    constructor(path) {
        this._isDirty = false;
        this._isValid = false;
        this._path = path;
        this._compileCommands = this.createCompileCommands(path);
        if (this.length) {
            this._isValid = true;
        }
    }
    get compileCommands() {
        return this._compileCommands;
    }
    get path() {
        return this._path;
    }
    get isValid() {
        return this._isValid;
    }
    get isDirty() {
        return this._isDirty;
    }
    set isDirty(value) {
        this._isDirty = value;
    }
    *[Symbol.iterator]() {
        for (let commandObject of this._compileCommands) {
            yield commandObject;
        }
    }
    get length() {
        return this._compileCommands.length;
    }
    getCommandObjectFrom(index) {
        return this._compileCommands[index];
    }
    /**
     * This doesn't check for duplicates
     * @param commandObject
     */
    addCommandObject(commandObject) {
        this._compileCommands.push(commandObject);
        this.isDirty = true;
    }
    /**
     * @returns empty array on error
     */
    createCompileCommands(path) {
        const jsonString = shared.readStringFromFileSync(path);
        if (!jsonString) {
            console.error(`Couldn't read compile commands file: ${path}`);
            return [];
        }
        const compileCommands = shared.jsonParseSafe(jsonString);
        if (!compileCommands) {
            console.error("Couldn't parse compile commands.");
            return [];
        }
        return compileCommands;
    }
    /**
    * @returns Non-duplicate string array of every match. undefined if can't find matches
    */
    getUniqueMatchesFromAllCommandLines(regExp) {
        var _a;
        if (!((_a = this._compileCommands[0]) === null || _a === void 0 ? void 0 : _a.command)) {
            console.error("No compile commands found in compile command's file. Try resetting UE4 project.");
            return;
        }
        let uniqueMatches = new Set();
        for (const commandObject of this) {
            if (!commandObject.command) {
                continue;
            }
            const match = commandObject.command.match(regExp);
            if (match === null || match === void 0 ? void 0 : match.length) {
                for (const path of match) {
                    uniqueMatches.add(path);
                }
            }
        }
        if (!uniqueMatches.size) {
            console.log(`Regex couldn't parse matches in compile commands file. re: ${regExp.source} , flags: ${regExp.flags}`);
            return;
        }
        return [...uniqueMatches];
    }
    /**
     * @returns undefined if it doesn't use response files.
     */
    getAllUsedResponsePaths() {
        return this.getUniqueMatchesFromAllCommandLines(new RegExp(exports.RE_RESPONSE_FILE_PATH, "gm"));
    }
    saveToFile() {
        if (!this.isValid || !this.isDirty) {
            if (!this.isDirty) {
                console.log("Compile Command Object wasn't modifed. Will not write file.");
            }
            return;
        }
        const compileCommandsString = JSON.stringify(this.compileCommands, undefined, consts_1.JSON_SPACING);
        shared.writeJsonToFileSync(this.path, compileCommandsString);
        console.log(`File write: ${this.path}`);
    }
}
exports.CompileCommands = CompileCommands;
//# sourceMappingURL=compileCommands.js.map