
import { CommandObject } from './ntypes';

export class CompileCommands {

    protected _path: string;
    protected _compileCommands: CommandObject[];
    protected _isDirty: boolean;
    protected _hasInvalidPaths;

    constructor(path: string, compileCommands: CommandObject[]) {
        this._path = path;
        this._compileCommands = compileCommands;
        this._isDirty = false;
        this._hasInvalidPaths = false;
    }

    get compileCommands(): CommandObject[] {
        return this._compileCommands;
    }

    get path(): string {
        return this._path;
    }

    get isDirty(): boolean {
        return this._isDirty;
    }
    set isDirty(wasModified: boolean) {
        this._isDirty = wasModified;
    }

    get hasInvalidPaths(): boolean {
        return this._hasInvalidPaths;
    }
    set hasInvalidPaths(wasModified: boolean) {
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
    getUniqueMatchesFromAllCommandLines(regExp: RegExp): string[] | undefined {

        if (!this._compileCommands?.[0]?.command) {
            console.error("No compile commands found in compile command's file. Try resetting UE4 project.");
            return;
        }

        let uniqueMatches: Set<string> = new Set<string>();

        for (const commandObject of this) {
            if (!commandObject.command) {
                continue;
            }

            const match: RegExpMatchArray | undefined = CompileCommands.getMatchFromCommandLine(regExp, commandObject);

            if (match?.length) {
                for(const path of match){
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
    static getMatchFromCommandLine(regExp: RegExp, commandObject: CommandObject): RegExpMatchArray | undefined {

        if (!commandObject.command) {
            return;
        }

        const match: RegExpMatchArray | null = commandObject.command.match(regExp);
        
        if(!match?.length){
            return;
        }

        return match;
    }

 }
