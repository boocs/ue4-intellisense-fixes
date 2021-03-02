"use strict";
/**
    UE4 project v4.25.*
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.V425Project = void 0;
const projectUE4_1 = require("./projectUE4");
class V425Project extends projectUE4_1.ProjectUE4 {
    // Use create to contruct
    constructor() {
        super();
    }
    static async create() {
        const project = new V425Project();
        const isValid = await project.v425PostConstructionSetup();
        return isValid ? project : undefined;
    }
    async v425PostConstructionSetup() {
        const isValid = await super.ue4PostConstructionSetup(true, true, true, true);
        if (!isValid) {
            return false;
        }
        return true;
    }
}
exports.V425Project = V425Project;
//# sourceMappingURL=v425Project.js.map