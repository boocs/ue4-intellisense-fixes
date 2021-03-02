"use strict";
/**
    Compile Commands with response file UE4 project v4.26.1+ (most likely)
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.CCResponseProject = void 0;
const projectUE4_1 = require("./projectUE4");
class CCResponseProject extends projectUE4_1.ProjectUE4 {
    // Use create to construct
    constructor() {
        super();
    }
    static async create() {
        const project = new CCResponseProject();
        const isValid = await project.cCResponsePostConstructionSetup();
        return isValid ? project : undefined;
    }
    async cCResponsePostConstructionSetup() {
        let isValid = await super.ue4PostConstructionSetup(true, true, true, true);
        if (!isValid) {
            return false;
        }
        isValid = this.loadMainFirstConfigCompileCommands();
        if (!isValid) {
            return false;
        }
        return true;
    }
}
exports.CCResponseProject = CCResponseProject;
//# sourceMappingURL=CCResponseProject.js.map