"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidatedBuilderBase = void 0;
class ValidatedBuilderBase {
    constructor() {
        this._isValid = false;
    }
    get isValid() {
        return this._isValid;
    }
    set isValid(value) {
        this._isValid = value;
    }
    basePostConstructionSetup() {
        return true;
    }
}
exports.ValidatedBuilderBase = ValidatedBuilderBase;
//# sourceMappingURL=builderBase.js.map