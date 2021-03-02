"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixWrongCppStandard = void 0;
const vscode = require("vscode");
const consts_1 = require("../../consts");
const console = require("../../console");
const EXTENSION_CPP_STANDARD_SETTING = "cppStandard";
function fixWrongCppStandard(project) {
    console.log("Attempting to fix wrong cppStandard.");
    const extensionSettings = vscode.workspace.getConfiguration(consts_1.CONFIG_SECTION_EXTENSION); // change to extension cppStandard
    const extensionCppStandard = extensionSettings === null || extensionSettings === void 0 ? void 0 : extensionSettings.get(EXTENSION_CPP_STANDARD_SETTING);
    if (!extensionCppStandard) {
        if (extensionCppStandard !== '') {
            console.error(`Extensions cppStandard setting was set to ${extensionCppStandard}. Will not fix.`);
        }
        else {
            console.log(`Extension's cppStandard setting was set to empty string. Doing nothing.`);
        }
        return;
    }
    const workSpacesCppStandard = getworkspacesCppStandard(project);
    if (!workSpacesCppStandard) {
        console.error("The cppStandard won't be changed.");
        return;
    }
    for (const key in workSpacesCppStandard) {
        const workspaceCppStandard = workSpacesCppStandard[key];
        workspaceCppStandard.cppStandard = extensionCppStandard;
        console.log(`The ${key} workspace c_cpp_properties.json's cppStandard is set to ${extensionCppStandard}`);
    }
}
exports.fixWrongCppStandard = fixWrongCppStandard;
/**
 * @param project
 * @logs error
 */
function getworkspacesCppStandard(project) {
    const mainCCppPropertiesConfiguration = project.getFirstCCppPropertiesConfiguration(project.mainWorkspaceKey);
    if (!mainCCppPropertiesConfiguration) {
        console.error("Couldn't get Main c_cpp_properties.json's first configuration.");
        return;
    }
    const ue4CCppPropertiesConfiguration = project.getFirstCCppPropertiesConfiguration(project.ue4WorkspaceKey);
    if (!ue4CCppPropertiesConfiguration) {
        console.error("Couldn't get UE4 c_cpp_properties.json's first configuration.");
        return;
    }
    const workspacesCppStandard = {};
    workspacesCppStandard[project.mainWorkspaceKey] = mainCCppPropertiesConfiguration;
    workspacesCppStandard[project.ue4WorkspaceKey] = ue4CCppPropertiesConfiguration;
    return workspacesCppStandard;
}
//# sourceMappingURL=wrongCppStandard.js.map