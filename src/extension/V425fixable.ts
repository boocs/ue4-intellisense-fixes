
import { V425Project } from "../project/v425Project";
import { Fixable } from "./fixable";
import { fixNoDefines } from "./fixes/noDefines";
import { fixTagIncludes } from "./fixes/tagIncludes";
import { fixWrongCppStandard } from "./fixes/wrongCppStandard";

import * as console from "../console";
import { fixWrongIntellisenseMode } from "./fixes/wrongIntellisenseMode";
import { fixPropCompilerPath } from "./fixes/propCompilerPath";


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

    protected async fixProject(ue_version: { major: number; minor: number; patch: number; }): Promise<void> {
                
        fixTagIncludes(this.project);
        console.log("End fix UE4 workspace(Add empty array to Tag Includes).\n");

        await fixNoDefines(this.project);
        console.log("End fix No Defines.\n");

        fixWrongCppStandard(this.project, ue_version);
        console.log("End fix wrong cppStandard.\n");

        await fixWrongIntellisenseMode(this.project);
        console.log("End fix wrong intellisense mode.\n");
        
        await fixPropCompilerPath(this.project);
        
        return;
    }

    protected async fixOptional(isEnabled: boolean): Promise<void> {
        return;
    }

    protected async postFixProject(): Promise<void> {
        
        await this.project.saveCCppProperties(this.project.mainWorkspaceKey);  // In case we need to set LimitSymbols settings
        await this.project.saveCCppProperties(this.project.ue4WorkspaceKey);
        return;
    }

}
