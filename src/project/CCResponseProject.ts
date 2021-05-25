/**
    Compile Commands with response file UE4 project v4.26.1+ (most likely)
*/

import { ProjectUE4 } from "./projectUE4";
import type { IsValid } from "./builderBase";


export class CCResponseProject extends ProjectUE4 {
    // Use create to construct
    private constructor() {
        super();
    }

    public static async create(): Promise<CCResponseProject | undefined> {

        const project = new CCResponseProject();

        const isValid: IsValid = await project.cCResponsePostConstructionSetup();

        return isValid? project : undefined;
    }

    protected async cCResponsePostConstructionSetup(){      

        let isValid = await super.ue4PostConstructionSetup(true, true, true, true);  

        if (!isValid ){
            return false;
        }

        isValid = this.loadCompileCommandsFromWorkspace(this.mainWorkspaceKey);
        if(!isValid){
            return false;
        }

        return true;
    }
}
