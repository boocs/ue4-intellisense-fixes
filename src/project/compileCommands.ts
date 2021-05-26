
import type { CommandObjectJson } from './ntypes';
import * as shared from "../shared";
import { JSON_SPACING } from '../consts';

import * as console from "../console";


export const RE_RESPONSE_FILE_PATH = "(?<= @\\\").*.rsp";


export class CompileCommands {

    protected _path: string;
    protected _compileCommands: CommandObjectJson[];
    protected _isDirty: boolean = false;
    protected _isValid : boolean = false;

    /**
     * @param path to compile commands file
     * @throws Error
     */
    constructor(path: string) {
        this._path = path;
        this._compileCommands = this.createCompileCommands(path);
        if(this.length){
            this._isValid = true;
        }
                
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
        for (let commandObject of this._compileCommands) {
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
    protected createCompileCommands(path: string): CommandObjectJson[] {
        const jsonString = shared.readStringFromFileSync(path);

        if(!jsonString){
            console.error(`Couldn't read compile commands file: ${path}`);
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

        if (!this._compileCommands[0]?.command) {
            console.error("No compile commands found in compile command's file. Try resetting UE project.");
            return;
        }

        let uniqueMatches: Set<string> = new Set<string>();

        for (const commandObject of this) {
            if (!commandObject.command) {
                continue;
            }

            const match: RegExpMatchArray | null = commandObject.command.match(regExp);

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
        return this.getUniqueMatchesFromAllCommandLines(new RegExp(RE_RESPONSE_FILE_PATH, "gm"));
    }


    public saveToFile(){
        if(!this.isValid || !this.isDirty) {
            if(!this.isDirty){
                console.log("Compile Command Object wasn't modifed. Will not write file.");
            }
            return;
        }

        const compileCommandsString = JSON.stringify(this.compileCommands, undefined, JSON_SPACING);
        shared.writeJsonToFileSync(this.path, compileCommandsString);

        console.log(`File write: ${this.path}`);
    }

 }
