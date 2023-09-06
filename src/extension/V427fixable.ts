

import {CCResponseFixable} from "./CCResponseFixable";
import { fixCompilerPaths } from "./fixes/compilerPath";
import { fixPropCompilerPath } from "./fixes/propCompilerPath";


export class V427Fixable extends CCResponseFixable {

    protected async fixProject(ue_version: { major: number; minor: number; patch: number; }): Promise<void> {

        // This needs to run first in case compile commands compiler path needs to be set in empty extension path setting
        await fixCompilerPaths(this.project, this.isOptionalFixesEnabled);

        await fixPropCompilerPath(this.project);  
        
        await super.fixProject(ue_version);

        return;
    }
}