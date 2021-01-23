"use strict";
/**
 * The UE4 workspace doesn't specify a tag parser path list. This leads to parsing the whole UE4 source folder for symbols we don't need.
 * The tag parser combines all workspaces together and main workspace has everything the tag parser needs anyway.
 * Because of this, we just need to set tag parser includes to an empty array.
 *
 * Also there seems to be a bug where this is the only way to reduce tag parser cache and speed things up some.
 * There seems to be no loss of functionality
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixTagIncludes = void 0;
const console = require("../../console");
async function fixTagIncludes(outCCppProperties, ue4Workspace) {
    var _a, _b;
    console.log("Attempting to fix Tag Includes.");
    const config = (_a = outCCppProperties === null || outCCppProperties === void 0 ? void 0 : outCCppProperties.configurations) === null || _a === void 0 ? void 0 : _a[0];
    if (!config) {
        console.error(`Error: outCCppProperties = ${(_b = outCCppProperties === null || outCCppProperties === void 0 ? void 0 : outCCppProperties.configurations) === null || _b === void 0 ? void 0 : _b.length}`);
        return;
    }
    config.browse = { path: [] };
    console.log("End Tag Includes.\n");
}
exports.fixTagIncludes = fixTagIncludes;
//# sourceMappingURL=tagIncludes.js.map