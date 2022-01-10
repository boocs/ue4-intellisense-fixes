import * as vscode from 'vscode';

export const EXTENSION_NAME = "UE Intellisense Fixes";

export const WORKSPACE_FOLDER_NAME_UE4 = "UE4";
export const WORKSPACE_FOLDER_NAME_UE5 = "UE5";

export const UE4_426_DIR_FOLDER_NAME = "UE_4.26";
export const UE4_425_DIR_FOLDER_NAME = "UE_4.25";

export const CONFIG_SECTION_EXTENSION = "UEIntellisenseFixes";

export const CONFIG_SETTING_ENABLE_FIXES = "enableFixes";
export const CONFIG_SETTING_ENABLE_OPTIONAL_FIXES = "enableOptionalFixes"; 

export const CONFIGURATION_C_CPP = "C_Cpp";
export const CONFIG_SETTING_DEFAULT_INCLUDE_PATH = "default.includePath";
export const CONFIG_SETTING_DEFAULT_BROWSE_PATH = "default.browse.path";
export const CONFIG_SETTING_DEFAULT_FORCED_INCLUDE = "default.forcedInclude";
export const CONFIG_SETTING_DEFAULT_COMPILER_PATH = "default.compilerPath";
export const CONFIG_SETTING_DEFAULT_INTELLISENSE_MODE = "default.intelliSenseMode";
export const CONFIG_SETTING_INTELLISENSE_ENGINE = "intelliSenseEngine";
export const CONFIG_SETTING_INTELLISENSE_ENGINE_TAG_PARSER = "Tag Parser";

export const CONFIG_SETTING_LIMIT_SYMBOLS_TO_INCLUDED_HEADERS = "default.browse.limitSymbolsToIncludedHeaders";

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
export const GLOB_WORKSPACE_FILE = "*.code-workspace";

export const QUICK_CHECKER_DEFINITIONS_FILE = "Definitions.";

export const UE4_BUILD_CONFIGURATION_DEVELOPMENT = "Development";

export const ENCODING_UTF_8 = "utf-8";
export const JSON_SPACING = 4;

export const MAIN_STATUS_TEXT_FIXING = "IF $(symbol-property)";
export const MAIN_STATUS_TEXT_DONE = "IF $(check)";
export const MAIN_STATUS_ALIGN = vscode.StatusBarAlignment.Left;
export const MAIN_STATUS_PRIORITY = -1500;
export const MAIN_STATUS_COMMAND = "UEIntellisenseFixes.showLog";
export const MAIN_STATUS_LIFE = 120000;

export const RE_SEPARATOR = "/";

// export const RE_COMPILE_COMMAND_INCLUDE_PATHS = /(?<=[\-|/]I\")(.*?)(?=\")/gm;
// 8/24/2021 Changed for 427 formatting change
export const RE_COMPILE_COMMAND_INCLUDE_PATHS = /(?<=[\/|\-]I\s?")(.*?)(?=")/gm;

export const RE_COMPILE_COMMAND_FORCED_PATHS = /(?<=[\-|/](include|FI)\s?")(.*?)(?=")/gm;

export const RE_PREINCLUDE_SHAREDPCH_PATH = /(?<=-(include|FI)\s?")(.*?SharedPCH\.Engine.*?)(?=")/gm;
export const RE_SHAREDPCH_SHORT_FILENAME = /SharedPCH.Engine.h/gm;
export const RE_SHAREDPCH_SHADOW_FILENAME = /SharedPCH.Engine.ShadowErrors.h/gm;
export const TEXT_SHAREDPCH_SHORT_FILENAME = "SharedPCH.Engine.h";
export const TEXT_SHAREDPCH_SHADOW_FILENAME = "SharedPCH.Engine.ShadowErrors.h";

export const RE_INCORRECT_FOLDER_INC = "Inc";
export const RE_COMPILE_COMMAND_INC_BAD_PATH = "(?<=[\\\\|\\/])Inc(?=\\\\|\\/)";
export const RE_COMPILE_COMMAND_COMPILER_EXE_AND_RSP_PATH = /(?:.*?(?= @)|@.*)/gm;

export const RE_COMPILE_COMMAND_RELIABILITY_BAD_PATH = "(?<=[\\\\|\\/])ReliabilityHandlerComponent";

export const REPLACEMENT_NAME_INC_TO_DEVELOPEMENT = "Development";
export const REPLACEMENT_NAME_RELIABILITY_TO_RELIABLE = "ReliableHComp";

export const UE4_SOURCE_ENCODING = "utf-8";
export const GLOB_UE4_SOURCE_FILE_VERSION_H = "Engine/Source/Runtime/Launch/Resources/Version.h";
export const RE_UE4_VERSION = "(?<=#define\\sENGINE_(?:MAJOR|MINOR|PATCH)_VERSION\\s)\\d+";

//export const MAIN_WORKSPACE_SOURCE_DIRECTORY_NAME = "Source";
export const GLOB_ALL_HEADERS_AND_SOURCE_FILES = "**/Source/**/*.{h,hpp,hh,HPP,c,cpp,cc,CPP}";

export const GLOB_PROJECT_RESET_FILE_CREATION = "Intermediate/TargetInfo.json";
export const FILE_WATCHER_EXEC_WAIT = 3000;
export const INTELLISENSE_ENABLE_DISABLE_DELAY = 3000;

export const LAUNCH_PATH_SUFFIX = ".vscode/launch.json";

export const TEXT_MSVC = "msvc";
export const RE_CLANG_PREINCLUDE_FLAG = /^-include/gm; //
export const RE_MSVC_PREINCLUDE_FLAG = /^\/FI/gm;

export const RE_MSVC_INCLUDE_FLAG = /^\/I/gm;
export const RE_CLANG_INCLUDE_FLAG = /^--include-directory/gm;

export const CLANG_PREINCLUDE_FLAG = "-include"; //
export const MSVC_PREINCLUDE_FLAG = `/FI`;

export const CLANG_INCLUDE_FLAG = "--include-directory";
export const MSVC_INCLUDE_FLAG = `/I`;



export const COMPILER_MSVC = "cl.exe";
export const COMPILER_CLANG = "clang++.exe";
export const COMPILER_CLANG_CL_NO_EXT = "clang-cl";

export const INTELLISENSE_MODE_CLANG_X64 = "windows-clang-x64";
export const INTELLISENSE_MODE_CLANG_X86 = "windows-clang-x86";
export const INTELLISENSE_MODE_MSVC_X64 = "windows-msvc-x64";
export const INTELLISENSE_MODE_MSVC_X86 = "windows-msvc-x86";
export const INTELLISENSE_MODE_MACOS_CLANG_ARM64 = "macos-clang-arm64";

export const PLATFORM_WINDOWS = "win32";
export const CPUID_MACM1 = "Apple M1";