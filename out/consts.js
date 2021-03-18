"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ON_RESET_WAIT_BEFORE_RUNNING_EXT = exports.GLOB_PROJECT_RESET_FILE_CREATION = exports.GLOB_ALL_HEADERS_AND_SOURCE_FILES = exports.MAIN_WORKSPACE_SOURCE_DIRECTORY_NAME = exports.RE_UE4_VERSION = exports.GLOB_UE4_SOURCE_FILE_VERSION_H = exports.UE4_SOURCE_ENCODING = exports.REPLACEMENT_NAME_RELIABILITY_TO_RELIABLE = exports.REPLACEMENT_NAME_INC_TO_DEVELOPEMENT = exports.RE_COMPILE_COMMAND_RELIABILITY_BAD_PATH = exports.RE_COMPILE_COMMAND_INC_BAD_PATH = exports.RE_INCORRECT_FOLDER_INC = exports.RE_COMPILE_COMMAND_FORCED_PATHS = exports.RE_COMPILE_COMMAND_INCLUDE_PATHS = exports.RE_SEPARATOR = exports.MAIN_STATUS_LIFE = exports.MAIN_STATUS_COMMAND = exports.MAIN_STATUS_PRIORITY = exports.MAIN_STATUS_ALIGN = exports.MAIN_STATUS_TEXT_DONE = exports.MAIN_STATUS_TEXT_FIXING = exports.JSON_SPACING = exports.ENCODING_UTF_8 = exports.UE4_BUILD_CONFIGURATION_DEVELOPMENT = exports.QUICK_CHECKER_DEFINITIONS_FILE = exports.GLOB_GENERATED_FILES = exports.GLOB_DEFINITIONS_FILES = exports.GLOB_ANY_UPROJECT_IN_TOPLEVEL = exports.GLOB_C_CPP_PROPERTIES_FILENAME = exports.GLOB_ANY_IN_PRIVATE_FOLDER = exports.GLOB_ANY_IN_PUBLIC_FOLDER = exports.GLOB_VSCODE_FOLDER = exports.CONFIG_VALUES_GENERIC_UE4_INCLUDE_PATHS = exports.CONFIG_VALUES_GENERIC_MAIN_BROWSE_PATHS = exports.CONFIG_VALUES_GENERIC_MAIN_INCLUDE_PATHS = exports.INCLUDE_PATH_RECURSIVE_SEARCH_SUFFIX = exports.PARTIAL_INCLUDE_PATH_UE4_INTERMEDIATE = exports.PARTIAL_INCLUDE_PATH_UE4_SOURCE = exports.VSCODE_SPECIAL_VAR_DEFAULT = exports.CONFIG_SETTING_LIMIT_SYMBOLS_TO_INCLUDED_HEADERS = exports.CONFIG_SETTING_DEFAULT_FORCED_INCLUDE = exports.CONFIG_SETTING_DEFAULT_BROWSE_PATH = exports.CONFIG_SETTING_DEFAULT_INCLUDE_PATH = exports.CONFIG_SETTING_ENABLE_OPTIONAL_FIXES = exports.CONFIG_SETTING_ENABLE_FIXES = exports.CONFIG_SECTION_EXTENSION = exports.UE4_425_DIR_FOLDER_NAME = exports.UE4_426_DIR_FOLDER_NAME = exports.WORKSPACE_FOLDER_NAME_UE4 = exports.EXTENSION_NAME = void 0;
const vscode = require("vscode");
exports.EXTENSION_NAME = "UE4 Intellisense Fixes";
exports.WORKSPACE_FOLDER_NAME_UE4 = "UE4";
exports.UE4_426_DIR_FOLDER_NAME = "UE_4.26";
exports.UE4_425_DIR_FOLDER_NAME = "UE_4.25";
exports.CONFIG_SECTION_EXTENSION = "UE4IntellisenseFixes";
exports.CONFIG_SETTING_ENABLE_FIXES = "enableFixes";
exports.CONFIG_SETTING_ENABLE_OPTIONAL_FIXES = "enableOptionalFixes";
exports.CONFIG_SETTING_DEFAULT_INCLUDE_PATH = "default.includePath";
exports.CONFIG_SETTING_DEFAULT_BROWSE_PATH = "default.browse.path";
exports.CONFIG_SETTING_DEFAULT_FORCED_INCLUDE = "default.forcedInclude";
exports.CONFIG_SETTING_LIMIT_SYMBOLS_TO_INCLUDED_HEADERS = "default.browse.limitSymbolsToIncludedHeaders";
exports.VSCODE_SPECIAL_VAR_DEFAULT = "${default}";
exports.PARTIAL_INCLUDE_PATH_UE4_SOURCE = "Engine/Source";
exports.PARTIAL_INCLUDE_PATH_UE4_INTERMEDIATE = "Engine/Intermediate";
exports.INCLUDE_PATH_RECURSIVE_SEARCH_SUFFIX = "**";
exports.CONFIG_VALUES_GENERIC_MAIN_INCLUDE_PATHS = [
    "${workspaceFolder}/Source",
];
exports.CONFIG_VALUES_GENERIC_MAIN_BROWSE_PATHS = [
    "${workspaceFolder}/Source"
];
exports.CONFIG_VALUES_GENERIC_UE4_INCLUDE_PATHS = [
    `\${workspaceFolder}/Engine/Source/${exports.INCLUDE_PATH_RECURSIVE_SEARCH_SUFFIX}`,
    `\${workspaceFolder}/Engine/Intermediate/${exports.INCLUDE_PATH_RECURSIVE_SEARCH_SUFFIX}`
];
exports.GLOB_VSCODE_FOLDER = ".vscode/";
exports.GLOB_ANY_IN_PUBLIC_FOLDER = "Source/**/Public/*.*";
exports.GLOB_ANY_IN_PRIVATE_FOLDER = "Source/**/Private/*.*";
exports.GLOB_C_CPP_PROPERTIES_FILENAME = "c_cpp_properties.json";
exports.GLOB_ANY_UPROJECT_IN_TOPLEVEL = "*.uproject";
exports.GLOB_DEFINITIONS_FILES = "Intermediate/Build/**/Definitions.*.h";
exports.GLOB_GENERATED_FILES = "Intermediate/Build/**/*.generated.h";
exports.QUICK_CHECKER_DEFINITIONS_FILE = "Definitions.";
exports.UE4_BUILD_CONFIGURATION_DEVELOPMENT = "Development";
exports.ENCODING_UTF_8 = "utf-8";
exports.JSON_SPACING = 4;
exports.MAIN_STATUS_TEXT_FIXING = "IF $(symbol-property)";
exports.MAIN_STATUS_TEXT_DONE = "IF $(check)";
exports.MAIN_STATUS_ALIGN = vscode.StatusBarAlignment.Left;
exports.MAIN_STATUS_PRIORITY = -1500;
exports.MAIN_STATUS_COMMAND = "UE4IntellisenseFixes.showLog";
exports.MAIN_STATUS_LIFE = 120000;
exports.RE_SEPARATOR = "/";
exports.RE_COMPILE_COMMAND_INCLUDE_PATHS = `(?<=-[IF]\")(.*?)(?=\")${exports.RE_SEPARATOR}gm`;
exports.RE_COMPILE_COMMAND_FORCED_PATHS = `(?<=-include ")(.*?)(?=")${exports.RE_SEPARATOR}gm`;
exports.RE_INCORRECT_FOLDER_INC = "Inc";
exports.RE_COMPILE_COMMAND_INC_BAD_PATH = "(?<=[\\\\|\\/])Inc(?=\\\\|\\/)";
exports.RE_COMPILE_COMMAND_RELIABILITY_BAD_PATH = "(?<=[\\\\|\\/])ReliabilityHandlerComponent";
exports.REPLACEMENT_NAME_INC_TO_DEVELOPEMENT = "Development";
exports.REPLACEMENT_NAME_RELIABILITY_TO_RELIABLE = "ReliableHComp";
exports.UE4_SOURCE_ENCODING = "utf-8";
exports.GLOB_UE4_SOURCE_FILE_VERSION_H = "Engine/Source/Runtime/Launch/Resources/Version.h";
exports.RE_UE4_VERSION = "(?<=#define\\sENGINE_(?:MAJOR|MINOR|PATCH)_VERSION\\s)\\d+";
exports.MAIN_WORKSPACE_SOURCE_DIRECTORY_NAME = "Source";
exports.GLOB_ALL_HEADERS_AND_SOURCE_FILES = "**/*.{h,hpp,hh,HPP,c,cpp,cc,CPP}";
exports.GLOB_PROJECT_RESET_FILE_CREATION = "Intermediate/TargetInfo.json";
exports.ON_RESET_WAIT_BEFORE_RUNNING_EXT = 3000;
//# sourceMappingURL=consts.js.map