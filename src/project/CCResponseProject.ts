/**
    Compile Commands with response file project v4.26.1+ (most likely)
*/

import { ProjectUE4 } from "./projectUE4";
import type { IsValid } from "./builderBase";


export class CCResponseProject extends ProjectUE4 {
    // Use create to construct
    protected constructor() {
        super();
    }

    public static async create(isOptionalFixesEnabled: boolean): Promise<CCResponseProject | undefined> {

        const project = new CCResponseProject();

        const isValid: IsValid = await project.cCResponsePostConstructionSetup(isOptionalFixesEnabled);

        return isValid? project : undefined;
    }

    protected async cCResponsePostConstructionSetup(isOptionalFixesEnabled: boolean){

        let isValid = await super.ue4PostConstructionSetup(true, true, true, true);  

        if (!isValid ){
            return false;
        }

        isValid = this.loadCompileCommandsFromWorkspace(this.mainWorkspaceKey);
        if(!isValid){
            return false;
        }

        // Optional fixes aren't enabled so we load the ue4 compile commands for any fixes that maybe needed
        if (!isOptionalFixesEnabled) {
            const isSuccess = this.loadCompileCommandsFromWorkspace(this.ue4WorkspaceKey);

            if (!isSuccess) {
                console.error("Optional fixes are disabled but can't find any UE4 workspace compile commands. Resetting the project should fix this.");
            }
        }

        return true;
    }
}
