
import { V425Project } from "../project/v425Project";
import { Fixable } from "./fixable";
import { fixNoDefines } from "./fixes/noDefines";
import { fixTagIncludes } from "./fixes/tagIncludes";
import { fixWrongCppStandard } from "./fixes/wrongCppStandard";

import * as console from "../console";


export class V425Fixable extends Fixable {
    
    constructor(isFixesEnabled: boolean, isOptionalFixesEnabled: boolean) {
        super(isFixesEnabled, isOptionalFixesEnabled);
    }

    public get project(): V425Project {
        return this._project as V425Project;
    }

    protected async initializeProject(): Promise<V425Project | undefined> {
       return await V425Project.create();
    }

    protected async fixProject(): Promise<void> {
                
        fixTagIncludes(this.project);
        console.log("End fix UE4 workspace(Add empty array to Tag Includes).\n");

        await fixNoDefines(this.project);
        console.log("End fix No Defines.\n");

        fixWrongCppStandard(this.project);
        console.log("End fix wrong cppStandard.\n");
        
        return;
    }

    protected async fixOptional(): Promise<void> {
        return;
    }

    protected async postFixProject(): Promise<void> {
        
        this.project.saveCCppProperties(this.project.mainWorkspaceKey);  // In case we need to set LimitSymbols settings
        this.project.saveCCppProperties(this.project.ue4WorkspaceKey);
        return;
    }

}
