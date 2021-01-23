import * as vscode from 'vscode';

export const EXTENSION_NAME = "UE4 Intellisense Fixes";

export const WORKSPACE_FOLDER_NAME_UE4 = "UE4";

export const UE4_426_DIR_FOLDER_NAME = "UE_4.26";
export const UE4_425_DIR_FOLDER_NAME = "UE_4.25";

export const CONFIG_SECTION_EXTENSION = "UE4IntellisenseFixes";
export const CONFIG_SECTION_C_CPP = "C_Cpp";


export const CONFIG_SETTING_426_ENABLE_COMPILE_COMMANDS_FIX = "v426.compileCommands.enableFix";

export const CONFIG_SETTING_426_ENABLE_GENERIC_INC = "v426.enableGeneralIncludes"; 
export const CONFIG_SETTING_426_INCLUDES_REGEX = "v426.includesRegex";
export const CONFIG_SETTING_426_FORCED_REGEX = "v426.forcedRegex";


export const CONFIG_SETTING_426_PATH_SUBSTRING = "v426.pathSubstring";
export const CONFIG_SETTING_426_ENABLE_CONVERTER_FIX = "v426.converter.enableFix";


export const CONFIG_SETTING_425_ENABLE_FIX = "v425.enableFix";
export const CONFIG_SETTING_425_PATH_SUBSTRING = "v425.pathSubstring";

export const CONFIG_SETTING_DEFAULT_INCLUDE_PATH = "default.includePath";
export const CONFIG_SETTING_DEFAULT_BROWSE_PATH = "default.browse.path";
export const CONFIG_SETTING_DEFAULT_FORCED_INCLUDE = "default.forcedInclude";

export const VSCODE_SPECIAL_VAR_DEFAULT = "${default}";

export const PARTIAL_INCLUDE_PATH_UE4_SOURCE = "Engine/Source";
export const PARTIAL_INCLUDE_PATH_UE4_INTERMEDIATE = "Engine/Intermediate";

export const INCLUDE_PATH_RECURSIVE_SEARCH_SUFFIX = "**";

export const CONFIG_VALUES_GENERIC_MAIN_INCLUDE_PATHS = [
    "${workspaceFolder}/Source",
];

export const CONFIG_VALUES_GENERIC_MAIN_BROWSE_PATHS = [
    "${workspaceFolder}/Source"
]; 

export const CONFIG_VALUES_GENERIC_UE4_INCLUDE_PATHS = [
    `\${workspaceFolder}/Engine/Source/${INCLUDE_PATH_RECURSIVE_SEARCH_SUFFIX}`,
    `\${workspaceFolder}/Engine/Intermediate/${INCLUDE_PATH_RECURSIVE_SEARCH_SUFFIX}`
];

export const GLOB_VSCODE_FOLDER = ".vscode/";
export const GLOB_ANY_IN_PUBLIC_FOLDER = "Source/**/Public/*.*";
export const GLOB_ANY_IN_PRIVATE_FOLDER = "Source/**/Private/*.*";
export const GLOB_C_CPP_PROPERTIES_FILENAME = "c_cpp_properties.json";
export const GLOB_ANY_UPROJECT_IN_TOPLEVEL = "*.uproject";
export const GLOB_DEFINITIONS_FILES = "Intermediate/Build/**/Definitions.*.h";
export const GLOB_GENERATED_FILES = "Intermediate/Build/**/*.generated.h";

export const QUICK_CHECKER_DEFINITIONS_FILE = "Definitions.";

export const UE4_BUILD_CONFIGURATION_DEVELOPMENT = "Development";

export const ENCODING_UTF_8 = "utf-8";
export const JSON_SPACING = 4;

export const MAIN_STATUS_TEXT_FIXING = "IF $(symbol-property)";
export const MAIN_STATUS_TEXT_DONE = "IF $(check)";
export const MAIN_STATUS_ALIGN = vscode.StatusBarAlignment.Left;
export const MAIN_STATUS_PRIORITY = -1500;
export const MAIN_STATUS_COMMAND = "UE4IntellisenseFixes.showLog";
export const MAIN_STATUS_LIFE = 30000;

export const RE_SEPARATOR = "/";
export const RE_COMPILE_COMMAND_INCLUDE_PATHS = `(?<=-[IF]\")(.*?)(?=\")${RE_SEPARATOR}gm`;
export const RE_COMPILE_COMMAND_FORCED_PATHS = `(?<=-include ")(.*?)(?=")${RE_SEPARATOR}gm`;


export const RE_INCORRECT_FOLDER_INC = "Inc";
export const RE_COMPILE_COMMAND_INC_BAD_PATH = "(?<=[\\\\|\\/])Inc(?=\\\\|\\/)";

export const RE_COMPILE_COMMAND_RELIABILITY_BAD_PATH = "(?<=[\\\\|\\/])ReliabilityHandlerComponent";

export const REPLACEMENT_NAME_INC_TO_DEVELOPEMENT = "Development";
export const REPLACEMENT_NAME_RELIABILITY_TO_RELIABLE = "ReliableHComp";
