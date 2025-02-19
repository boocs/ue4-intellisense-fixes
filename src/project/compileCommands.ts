
import type { CommandObjectJson } from './ntypes';
import * as shared from "../shared";
import { JSON_SPACING } from '../consts';

import * as console from "../console";

// Response Path = Escaped forward slash, escaped backslash, escaped word char, colon, period, space
export const RE_RESPONSE_FILE_PATH = `[\\\/\\\\\\\w:. -]+.rsp`;

export class CompileCommands {

    protected _path: string;
    protected _compileCommands: CommandObjectJson[];
    protected _isDirty = false;
    protected _isValid  = false;

    /**
     * @param path to compile commands file
     * @throws Error
     */
    private constructor(pathStr: string, compileCommands: CommandObjectJson[]) {
        this._path = pathStr;
        this._compileCommands = compileCommands;
        if(this.length){  // This class is an iterator so it checks _compileCommands length
            this._isValid = true;
        }
                
    }

    public static async create(pathStr: string) {
        const compileCommands = await CompileCommands.createCompileCommands(pathStr);

        return new CompileCommands(pathStr, compileCommands);
    }

    get compileCommands(): CommandObjectJson[] {
        return this._compileCommands;
    }

    get path(): string {
        return this._path;
    }

    get isValid(): boolean {
        return this._isValid;
    }

    get isDirty(): boolean {
        return this._isDirty;
    }
    set isDirty(value: boolean) {
        this._isDirty = value;
    }

    *[Symbol.iterator]() {
        for (const commandObject of this._compileCommands) {
            yield commandObject;
        }
    }

    public get length(): number {
        return this._compileCommands.length;
    }

    public getCommandObjectFrom(index: number): CommandObjectJson {
        return this._compileCommands[index];
    }

    /**
     * This doesn't check for duplicates
     * @param commandObject 
     */
    public addCommandObject(commandObject: CommandObjectJson) {
        this._compileCommands.push(commandObject);
        this.isDirty = true;
    }

    /**
     * @returns empty array on error
     */
    protected static async createCompileCommands(pathStr: string): Promise<CommandObjectJson[]> {
        const jsonString = await shared.readStringFromFile(pathStr);

        if(!jsonString){
            console.error(`Couldn't read compile commands file: ${pathStr}`);
            return [];
        }
        
        const compileCommands = shared.jsonParseSafe(jsonString);
        if(!compileCommands){
            console.error("Couldn't parse compile commands.");
            return [];
        }

        return compileCommands;
    }

    /**
    * @returns Non-duplicate string array of every match. undefined if can't find matches
    */
    getUniqueMatchesFromAllCommandLines(regExp: RegExp): string[] | undefined {

        if (!this._compileCommands[0]?.command && !this._compileCommands[0]?.arguments) {
            console.error("No compile commands found in compile command's file. Try resetting UE project.");
            return;
        }

        const uniqueMatches: Set<string> = new Set<string>();

        for (const commandObject of this) {
            
                let responseFileString = "";

                if(commandObject.command){
                    responseFileString = commandObject.command;
                }
                else if(commandObject.arguments && commandObject.arguments.length > 1){
                    responseFileString = commandObject.arguments[1];
                }
                else{
                    continue;
                }

                const match: RegExpMatchArray | null = responseFileString.match(regExp);

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
     * @returns undefined if it doesn't use response files.
     */
    public getAllUsedResponsePaths() : string[] | undefined {
        const re = new RegExp(RE_RESPONSE_FILE_PATH,"gm");
        return this.getUniqueMatchesFromAllCommandLines(re);
    }


    public async saveToFile(){
        if(!this.isValid || !this.isDirty) {
            if(!this.isDirty){
                console.log("Compile Command Object wasn't modifed. Will not write file.");
            }
            return;
        }

        const compileCommandsString = JSON.stringify(this.compileCommands, undefined, JSON_SPACING);
        await shared.writeJsonOrStringToFile(this.path, compileCommandsString);

        console.log(`File write: ${this.path}`);
    }

 }
