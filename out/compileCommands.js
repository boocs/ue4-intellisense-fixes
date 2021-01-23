"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompileCommands = void 0;
class CompileCommands {
    constructor(path, compileCommands) {
        this._path = path;
        this._compileCommands = compileCommands;
        this._isDirty = false;
        this._hasInvalidPaths = false;
    }
    get compileCommands() {
        return this._compileCommands;
    }
    get path() {
        return this._path;
    }
    get isDirty() {
        return this._isDirty;
    }
    set isDirty(wasModified) {
        this._isDirty = wasModified;
    }
    get hasInvalidPaths() {
        return this._hasInvalidPaths;
    }
    set hasInvalidPaths(wasModified) {
        this._hasInvalidPaths = wasModified;
    }
    *[Symbol.iterator]() {
        for (let commandObject of this._compileCommands) {
            yield commandObject;
        }
    }
    /**
    * @returns Non-duplicate string array of every match. undefined if can't find matches
    */
    getUniqueMatchesFromAllCommandLines(regExp) {
        var _a, _b;
        if (!((_b = (_a = this._compileCommands) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.command)) {
            console.error("No compile commands found in compile command's file. Try resetting UE4 project.");
            return;
        }
        let uniqueMatches = new Set();
        for (const commandObject of this) {
            if (!commandObject.command) {
                continue;
            }
            const match = CompileCommands.getMatchFromCommandLine(regExp, commandObject);
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
    * @returns Matches from the command string. undefined if can't find matches
    */
    static getMatchFromCommandLine(regExp, commandObject) {
        if (!commandObject.command) {
            return;
        }
        const match = commandObject.command.match(regExp);
        if (!(match === null || match === void 0 ? void 0 : match.length)) {
            return;
        }
        return match;
    }
}
exports.CompileCommands = CompileCommands;
//# sourceMappingURL=compileCommands.js.map