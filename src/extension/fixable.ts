
import type { ProjectUE4 } from "../project/projectUE4";

import * as console from "../console";


export abstract class Fixable{

    protected _project: ProjectUE4 | undefined;
    protected _isFixesEnabled: boolean;
    protected _isOptionalFixesEnabled: boolean;

    constructor(isFixesEnabled: boolean, isOptionalFixesEnabled: boolean) {
        this._isFixesEnabled = isFixesEnabled;
        this._isOptionalFixesEnabled = isOptionalFixesEnabled;
    }

    public abstract get project(): ProjectUE4;

    public get isOptionalFixesEnabled() {
        return this._isOptionalFixesEnabled;
    }
   
    public async execFixes() : Promise<void> { 
        
        this._project = await this.initializeProject();
        if(!this._project){
            console.error("This fixable project hasn't been initialized properly and is invalid.");
            return;
        }

        if(this._isFixesEnabled){
            await this.fixProject();
        }
        else{
            console.log("Fixes aren't enabled in settings.");
        }
        
        if(this._isOptionalFixesEnabled){
            await this.fixOptional();
        }
        else {
            console.log("Optional Fixes aren't enabled in the settings.");
        }
        
        if(this._isFixesEnabled || this._isOptionalFixesEnabled){
            await this.postFixProject();
        }
        
        return;
    };

    protected abstract initializeProject() : Promise<ProjectUE4|undefined>;
    protected abstract fixProject() : Promise<void>;
    protected abstract fixOptional() : Promise<void>;
    protected abstract postFixProject(): Promise<void>;
    
}
