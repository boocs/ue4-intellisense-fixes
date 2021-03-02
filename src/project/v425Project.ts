/**
    UE4 project v4.25.*
*/

import { ProjectUE4 } from "./projectUE4";
import type { IsValid } from "./builderBase";


export class V425Project extends ProjectUE4 {
    // Use create to contruct
    private constructor() {
        super();
    }

    public static async create(): Promise<V425Project | undefined> {

        const project: V425Project = new V425Project();

        const isValid: IsValid = await project.v425PostConstructionSetup();

        return isValid? project : undefined;
    }

    protected async v425PostConstructionSetup(){      

        const isValid = await super.ue4PostConstructionSetup(true, true, true, true);

        if (!isValid ){
            return false;
        }

        return true;
    }
}
