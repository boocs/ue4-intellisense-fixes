"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fixable = void 0;
const console = require("../console");
class Fixable {
    constructor(isFixesEnabled, isOptionalFixesEnabled) {
        this._isFixesEnabled = isFixesEnabled;
        this._isOptionalFixesEnabled = isOptionalFixesEnabled;
    }
    async execFixes() {
        this._project = await this.initializeProject();
        if (!this._project) {
            console.error("This fixable project hasn't been initialized properly and is invalid.");
            return;
        }
        if (this._isFixesEnabled) {
            await this.fixProject();
        }
        else {
            console.log("Fixes aren't enabled in settings.");
        }
        if (this._isOptionalFixesEnabled) {
            await this.fixOptional();
        }
        else {
            console.log("Optional Fixes aren't enabled in the settings.");
        }
        if (this._isFixesEnabled || this._isOptionalFixesEnabled) {
            await this.postFixProject();
        }
        return;
    }
    ;
}
exports.Fixable = Fixable;
//# sourceMappingURL=fixable.js.map