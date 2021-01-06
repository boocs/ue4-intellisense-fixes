"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSON_SPACING = exports.ENCODING_UTF_8 = exports.UE4_BUILD_CONFIGURATION_DEVELOPMENT = exports.GLOB_DEFINITIONS_FILES = exports.GLOB_ANY_UPROJECT_IN_TOPLEVEL = exports.GLOB_C_CPP_PROPERTIES_FILENAME = exports.GLOB_VSCODE_FOLDER = exports.CONFIG_VALUES_UE4_SOURCE_BROWSE_PATHS = exports.CONFIG_VALUES_UE4_SOURCE_INCLUDE_PATHS = exports.VSCODE_SPECIAL_VAR_DEFAULT = exports.CONFIG_SETTING_DEFAULT_FORCED_INCLUDE = exports.CONFIG_SETTING_DEFAULT_BROWSE_PATH = exports.CONFIG_SETTING_DEFAULT_INCLUDE_PATH = exports.CONFIG_SETTING_426_PATH_SUBSTRING = exports.CONFIG_SETTING_426_FIX_UE4_SOURCE = exports.CONFIG_SETTING_426_FIX_NO_COMPILER = exports.CONFIG_SETTING_426_FIX_WRONG_PROJECT = exports.CONFIG_SECTION_C_CPP = exports.CONFIG_SECTION_EXTENSION = exports.UE4_425_DIR_FOLDER_NAME = exports.UE4_426_DIR_FOLDER_NAME = exports.WORKSPACE_FOLDER_NAME_UE4 = exports.EXTENSION_NAME = void 0;
exports.EXTENSION_NAME = "UE4 Intellisense Fixes";
exports.WORKSPACE_FOLDER_NAME_UE4 = "UE4";
exports.UE4_426_DIR_FOLDER_NAME = "UE_4.26";
exports.UE4_425_DIR_FOLDER_NAME = "UE_4.25";
exports.CONFIG_SECTION_EXTENSION = "UE4IntellisenseFixes";
exports.CONFIG_SECTION_C_CPP = "C_Cpp";
exports.CONFIG_SETTING_426_FIX_WRONG_PROJECT = "v426.fix.enableWrongProject";
exports.CONFIG_SETTING_426_FIX_NO_COMPILER = "v426.fix.enableNoCompiler";
exports.CONFIG_SETTING_426_FIX_UE4_SOURCE = "v426.fix.enableUE4Source";
exports.CONFIG_SETTING_426_PATH_SUBSTRING = "v426.pathSubstring";
exports.CONFIG_SETTING_DEFAULT_INCLUDE_PATH = "default.includePath";
exports.CONFIG_SETTING_DEFAULT_BROWSE_PATH = "default.browse.path";
exports.CONFIG_SETTING_DEFAULT_FORCED_INCLUDE = "default.forcedInclude";
exports.VSCODE_SPECIAL_VAR_DEFAULT = "${default}";
exports.CONFIG_VALUES_UE4_SOURCE_INCLUDE_PATHS = [
    exports.VSCODE_SPECIAL_VAR_DEFAULT,
    "${workspaceFolder}/Engine/Source/**",
    "${workspaceFolder}/Engine/Intermediate/**"
];
exports.CONFIG_VALUES_UE4_SOURCE_BROWSE_PATHS = [
    exports.VSCODE_SPECIAL_VAR_DEFAULT,
    "${workspaceFolder}/Engine/Source",
    "${workspaceFolder}/Engine/Intermediate"
];
exports.GLOB_VSCODE_FOLDER = ".vscode/";
exports.GLOB_C_CPP_PROPERTIES_FILENAME = "c_cpp_properties.json";
exports.GLOB_ANY_UPROJECT_IN_TOPLEVEL = "*.uproject";
exports.GLOB_DEFINITIONS_FILES = "Intermediate/Build/**/Definitions.*.h";
exports.UE4_BUILD_CONFIGURATION_DEVELOPMENT = "Development";
exports.ENCODING_UTF_8 = "utf-8";
exports.JSON_SPACING = 4;
//# sourceMappingURL=consts.js.map