"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CCResponseFixable = void 0;
const CCResponseProject_1 = require("../project/CCResponseProject");
const fixable_1 = require("./fixable");
const missingCompileCommands_1 = require("./fixes/missingCompileCommands");
const invalidPaths_1 = require("./fixes/invalidPaths");
const tagIncludes_1 = require("./fixes/tagIncludes");
const optimizeUE4_1 = require("./fixes/optimizeUE4");
const wrongCppStandard_1 = require("./fixes/wrongCppStandard");
const console = require("../console");
class CCResponseFixable extends fixable_1.Fixable {
    constructor(isFixesEnabled, isOptionalFixesEnabled) {
        super(isFixesEnabled, isOptionalFixesEnabled);
    }
    get project() {
        return this._project;
    }
    async initializeProject() {
        return await CCResponseProject_1.CCResponseProject.create();
    }
    async fixProject() {
        invalidPaths_1.fixAllResponseFileKnownInvalidPaths(this.project);
        console.log("End fixing invalid paths in response files.\n");
        await missingCompileCommands_1.fixMissingResponseCompileCommands(this.project);
        console.log("End fix missing compile commands.\n");
        tagIncludes_1.fixTagIncludes(this.project);
        console.log("End fix UE4 workspace(Add empty tag parser).\n");
        wrongCppStandard_1.fixWrongCppStandard(this.project);
        console.log("End fix wrong cppStandard.\n");
        return;
    }
    async fixOptional() {
        optimizeUE4_1.fixUE4Optimization(this.project);
        console.log("End fix UE4 optimization.\n");
    }
    async postFixProject() {
        this.project.saveCCppProperties();
        return;
    }
}
exports.CCResponseFixable = CCResponseFixable;
//# sourceMappingURL=CCResponseFixable.js.map