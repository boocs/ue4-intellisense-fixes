
import { CCResponseProject } from "../project/CCResponseProject";

import {Fixable} from "./fixable";
import { fixMissingResponseCompileCommands } from "./fixes/missingCompileCommands";
import { fixResponse } from "./fixes/invalidPaths";
import { fixTagIncludes } from "./fixes/tagIncludes";
import { fixUE4Optimization } from "./fixes/optimizeUE4";
import { fixWrongCppStandard } from "./fixes/wrongCppStandard";

import * as console from "../console";
import { fixLaunchFile } from "./fixes/launch";



export class CCResponseFixable extends Fixable {
    constructor(isFixesEnabled: boolean, isOptionalFixesEnabled: boolean) {
        super(isFixesEnabled, isOptionalFixesEnabled);
    }
    
    public get project(): CCResponseProject {
        return this._project as CCResponseProject;
    }

    protected async initializeProject(): Promise<CCResponseProject | undefined> {        
        return await CCResponseProject.create(this.isOptionalFixesEnabled);
    }

    protected async fixProject(): Promise<void> {
        
        fixResponse(this.project);
        console.log("End fixing invalid paths in response files.\n");

        await fixMissingResponseCompileCommands(this.project);
        console.log("End fix missing compile commands.\n");

        fixTagIncludes(this.project);
        console.log("End fix UE workspace(Add empty tag parser).\n");

        fixWrongCppStandard(this.project);
        console.log("End fix wrong cppStandard.\n");

        fixLaunchFile(this.project);
        console.log("End fix launch.json.\n");

        return;
    }

    protected async fixOptional(): Promise<void> {

        fixUE4Optimization(this.project);
        console.log("End fix UE optimization.\n");
    }

    protected async postFixProject(): Promise<void> {
        this.project.saveCCppProperties();
        
        return;
    }

}
