
import { CCResponseProject } from "../project/CCResponseProject";

import {Fixable} from "./fixable";
import { fixMissingResponseCompileCommands } from "./fixes/missingCompileCommands";
import { fixResponse } from "./fixes/invalidPaths";
import { fixTagIncludes } from "./fixes/tagIncludes";
import { fixUEOptimization } from "./fixes/optimizeUE4";
import { fixWrongCppStandard } from "./fixes/wrongCppStandard";

import * as console from "../console";
import { fixLaunchFile } from "./fixes/launch";
import { fixWrongIntellisenseMode } from "./fixes/wrongIntellisenseMode";
import { fixGenerated } from "./fixes/generated";
import { warnPubPrivDir } from "./fixes/pubPrivDir";


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
        
        await fixResponse(this.project);
        console.log("End fixing invalid paths in response files.\n");

        await fixGenerated(this.project);
        console.log("End fixing *.generated.h\n")

        await fixMissingResponseCompileCommands(this.project);
        console.log("End fix missing compile commands.\n");

        await warnPubPrivDir(this.project);
        console.log("End warn Public/Private Directory\n")

        fixTagIncludes(this.project);
        console.log("End fix UE workspace(Add empty tag parser).\n");

        fixWrongCppStandard(this.project);
        console.log("End fix wrong cppStandard.\n");
        
        await fixLaunchFile(this.project);
        console.log("End fix launch.json.\n");

        await fixWrongIntellisenseMode(this.project);
        console.log("End fix wrong intellisense mode.\n");

        return;
    }

    protected async fixOptional(isEnabled: boolean): Promise<void> {

        await fixUEOptimization(this.project, isEnabled);
        console.log("End fix UE optimization.\n");
    }

    protected async postFixProject(): Promise<void> {
        await this.project.saveCCppProperties();
        
        return;
    }

}
