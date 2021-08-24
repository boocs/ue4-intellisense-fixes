

import {CCResponseFixable} from "./CCResponseFixable";
import { fixCompilerPaths } from "./fixes/compilerPath";


export class V427Fixable extends CCResponseFixable {

    protected async fixProject(): Promise<void> {
        
        fixCompilerPaths(this.project, this.isOptionalFixesEnabled);

        await super.fixProject();

        return;
    }
}