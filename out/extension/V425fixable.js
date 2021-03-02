"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.V425Fixable = void 0;
const v425Project_1 = require("../project/v425Project");
const fixable_1 = require("./fixable");
const noDefines_1 = require("./fixes/noDefines");
const tagIncludes_1 = require("./fixes/tagIncludes");
const wrongCppStandard_1 = require("./fixes/wrongCppStandard");
const console = require("../console");
class V425Fixable extends fixable_1.Fixable {
    constructor(isFixesEnabled, isOptionalFixesEnabled) {
        super(isFixesEnabled, isOptionalFixesEnabled);
    }
    get project() {
        return this._project;
    }
    async initializeProject() {
        return await v425Project_1.V425Project.create();
    }
    async fixProject() {
        tagIncludes_1.fixTagIncludes(this.project);
        console.log("End fix UE4 workspace(Add empty array to Tag Includes).\n");
        await noDefines_1.fixNoDefines(this.project);
        console.log("End fix No Defines.\n");
        wrongCppStandard_1.fixWrongCppStandard(this.project);
        console.log("End fix wrong cppStandard.\n");
        return;
    }
    async fixOptional() {
        return;
    }
    async postFixProject() {
        this.project.saveCCppProperties(this.project.mainWorkspaceKey); // In case we need to set LimitSymbols settings
        this.project.saveCCppProperties(this.project.ue4WorkspaceKey);
        return;
    }
}
exports.V425Fixable = V425Fixable;
//# sourceMappingURL=V425fixable.js.map