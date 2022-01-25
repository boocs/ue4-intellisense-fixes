

import {CCResponseFixable} from "./CCResponseFixable";
import { fixCompilerPaths } from "./fixes/compilerPath";
import { fixPropCompilerPath } from "./fixes/propCompilerPath";


export class V427Fixable extends CCResponseFixable {

    protected async fixProject(): Promise<void> {

        // This needs to happen before fixCompilerPaths
        // This means this will get called twice since it gets called for the 4.26 base class...
        // Made the function check if it's already run.
        fixPropCompilerPath(this.project);  
        
        fixCompilerPaths(this.project, this.isOptionalFixesEnabled);

        await super.fixProject();

        return;
    }
}