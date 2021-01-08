export const EXTENSION_NAME = "UE4 Intellisense Fixes";

export const WORKSPACE_FOLDER_NAME_UE4 = "UE4";

export const UE4_426_DIR_FOLDER_NAME = "UE_4.26";
export const UE4_425_DIR_FOLDER_NAME = "UE_4.25";

export const CONFIG_SECTION_EXTENSION = "UE4IntellisenseFixes";
export const CONFIG_SECTION_C_CPP = "C_Cpp";

export const CONFIG_SETTING_426_FIX_WRONG_PROJECT = "v426.fix.enableWrongProject";
export const CONFIG_SETTING_426_FIX_NO_COMPILER = "v426.fix.enableNoCompiler";
export const CONFIG_SETTING_426_FIX_UE4_SOURCE = "v426.fix.enableUE4Source";
export const CONFIG_SETTING_426_PATH_SUBSTRING = "v426.pathSubstring";

export const CONFIG_SETTING_425_FIX_NO_DEFINES = "v425.fix.enableNoDefines";
export const CONFIG_SETTING_425_PATH_SUBSTRING = "v425.pathSubstring";

export const CONFIG_SETTING_DEFAULT_INCLUDE_PATH = "default.includePath";
export const CONFIG_SETTING_DEFAULT_BROWSE_PATH = "default.browse.path";
export const CONFIG_SETTING_DEFAULT_FORCED_INCLUDE = "default.forcedInclude";

export const VSCODE_SPECIAL_VAR_DEFAULT = "${default}";

export const CONFIG_VALUES_UE4_SOURCE_INCLUDE_PATHS = [
    VSCODE_SPECIAL_VAR_DEFAULT,
    "${workspaceFolder}/Engine/Source/**",
    "${workspaceFolder}/Engine/Intermediate/**"
];

export const CONFIG_VALUES_UE4_SOURCE_BROWSE_PATHS = [
    VSCODE_SPECIAL_VAR_DEFAULT,
    "${workspaceFolder}/Engine/Source",
    "${workspaceFolder}/Engine/Intermediate"
];


export const GLOB_VSCODE_FOLDER = ".vscode/";
export const GLOB_C_CPP_PROPERTIES_FILENAME = "c_cpp_properties.json";
export const GLOB_ANY_UPROJECT_IN_TOPLEVEL = "*.uproject";
export const GLOB_DEFINITIONS_FILES = "Intermediate/Build/**/Definitions.*.h";

export const QUICK_CHECKER_DEFINITIONS_FILE = "Definitions.";

export const UE4_BUILD_CONFIGURATION_DEVELOPMENT = "Development";

export const ENCODING_UTF_8 = "utf-8";
export const JSON_SPACING = 4;
