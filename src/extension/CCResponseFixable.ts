
import { CCResponseProject } from "../project/CCResponseProject";

import {Fixable} from "./fixable";
import { fixMissingResponseCompileCommands } from "./fixes/missingCompileCommands";
import { fixAllResponseFileKnownInvalidPaths } from "./fixes/invalidPaths";
import { fixTagIncludes } from "./fixes/tagIncludes";
import { fixUE4Optimization } from "./fixes/optimizeUE4";
import { fixWrongCppStandard } from "./fixes/wrongCppStandard";

import * as console from "../console";



export class CCResponseFixable extends Fixable {
    constructor(isFixesEnabled: boolean, isOptionalFixesEnabled: boolean) {
        super(isFixesEnabled, isOptionalFixesEnabled);
    }
    
    public get project(): CCResponseProject {
        return this._project as CCResponseProject;
    }

    protected async initializeProject(): Promise<CCResponseProject | undefined> {        
        return await CCResponseProject.create();
    }

    protected async fixProject(): Promise<void> {
        
        fixAllResponseFileKnownInvalidPaths(this.project);
        console.log("End fixing invalid paths in response files.\n");

        await fixMissingResponseCompileCommands(this.project);
        console.log("End fix missing compile commands.\n");

        fixTagIncludes(this.project);
        console.log("End fix UE4 workspace(Add empty tag parser).\n");

        fixWrongCppStandard(this.project);
        console.log("End fix wrong cppStandard.\n");

        return;
    }

    protected async fixOptional(): Promise<void> {

        fixUE4Optimization(this.project);
        console.log("End fix UE4 optimization.\n");
    }

    protected async postFixProject(): Promise<void> {
        this.project.saveCCppProperties();
        
        return;
    }

}
