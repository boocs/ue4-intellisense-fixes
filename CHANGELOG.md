### [TODO]

# [3.1.4] 2022-6-22
### Fixed
- Mac M1 generated.h regex path tester (Not sure if it's M1 only fix or a general Mac fix)

# [3.1.3] 2022-6-20
### Added
- c++20 option for future or experimental projects

# [3.1.2] 2022-6-15
### Added
- Error messages when creating compile command object

## [3.1.1] 2022-6-14
### Fixed
- Non quoted Response file paths regex
### Changed
- Wording of Optional fixes
### Added
- Error messages for invalid projects

## [3.1.0] 2022-5-18
### Changed
- Simpler way for the extension's 'enableOptionalFixes' optimization setting. Now just uses Tag Parser for UE source.
### Fixed
- Launch json fix of this extension's previous launch json fix version to match console setting of UE5 to UE4
### Added
- Added error if *.generated.h files aren't Built yet
- Added error if *.generated.h path isn't in rsp files
- Add error if using UE5 and using the wrong cppStandard
- Added info message about default cppStandard for UE4/UE5
- Better warning if UE path isn't in *.code-workspace file
- Show total # of errors/warnings messages at end of log
- Warn if using the extension's path setting without strict enabled
- Warning if project is using Source/(ProjectName)/(Public/Private) directory structure
- Launch json fix refactor.

## [3.0.2] 2022-4-12
### Fixed
- Response file path regex for linux (and probably Mac)

## [3.0.1] 2022-4-6
### Fixed
- Changed to a different way of checking for UE's Version.h (away from findFiles)
- Changed all findFiles(api) to use fast-glob(node). findFiles was failing sometimes for unknown reasons.

  Thanks to @heptaspirit for helping test this!
- isValid project code so file watchers will work
### Changed
- Converted from node read/write file to vscode api read/write file
- Reset detection - Now just warns to restart VSCode
### Removed
- Convoluted progress bar code
### Security
- npm audit

## [2.5.0] 2022-1-25
### Added
- Fix for UE5 Preview 1's malformed json in launch.json

## [2.4.0] 2022-1-25
### Fixed
- Mac M1 fix will auto set compiler path in c_cpp_properties (Can also change the path in new extension settings)
### Added
- New compiler.path setting to force compiler path in c_cpp_properties.
- New compiler.strictPath setting to force compiler.path setting in compile commands file.
### Changed
- 4.26 now uses 4.27 code path. It shouldn't matter... and adds some of the new functionality to 4.26.
- Read/Write functions to work with newer lib 
### Removed
- Removed singular clang support for Windows. It can now be done with the newer general path settings.
### Security
- Updated dependencies
- Changed VSCode version compatibility version to 1.63.1+

## [2.3.1] 2022-01-17
### Fix
- Fix for startup bug not finding *.uproject file thus not starting the extension

## [2.3.0] 2022-01-10
### Added
- Fix for Mac M1 users to change Intellisense Mode automatically (untested)
### Removed
- Options for c++ standard not supported by UE

## [2.2.0] 2021-12-23
### Fixed
- Fixed an error message not getting logged
### Changed
- (4.27+/5.0+) Changed the way compiler path was getting fixed in compile command files.
- UE 5.0+ now uses compiler path fix that 4.27 uses
### Added
- (4.27+/5.0+) Added clang-cl.exe intellisense support to Windows. Add clang-cl.exe path to the cpptools extension User's compilerPath setting to use. 

## [2.1.2] 2021-10-18
### Added
- Allow cancelling all response file choices of missing compile commands  by [seesemichaelj](https://github.com/seesemichaelj)

## [2.1.1] 2021-10-12
### Fixed
- Fixed bug that didn't allow any version after 4.27.0 to be fixed
- Fixed unknown type errors inside catch blocks

## [2.1.0] 2021-8-24
### Fixed
- **Fixed** 4.27 New compiler path bug. It's using full path in compile command files when it shouldn't.
- **Fixed** Regex for response file include paths for 4.27.0 compatibility
- **Fixed** UE4 compile command weren't getting loaded for pontential fixing (needed if optional fixes were turned off)

### Removed
- auto disable/enable of intellisense (could interfere with other extensions)

## [2.0.1] 2021-7-3
- Security fix by updating dependencies
- Small fix to support Plugin development.
- Renamed function for readibility

## [2.0.0] 2021-5-26
- Update for UE5 support
- Updated setting names to be more general (will need to reenable fixes)

## [1.6.0] 2021-5-25
- Update allows fixes to work on all configs instead of only the first one (c_cpp_properties.json). 

## [1.5.1] 2021-5-12
- **Fixed** Updated dependencies
- **Fixed** Added 'null' check for response file operation
- Removed developer console log messages from release (doesn't affect user logs)

## [1.5.0] 2021-4-15
- **Fixed** Regex to read 4.26.2 cl.exe flags in response files was fixed. (In 4.26.2, cl flags use '/' instead of '-')
- **Fixed** New Source/Header fix for projects that build multiple modules. You can now select the response file for new files.
- **Fixed** UE4 workspace optimization now works with projects that build multiple modules.
- Removed the invalid Intellisense preinclude path fix since it couldn't encompass every single scenario
  - Added additional warning/info message for invalid Intellisense preinclude paths
- Added additional warnings messaging when adding new header/source files
- Added error message if response file contains only the word undefined

 
## [1.4.2] 2021-4-2
- **BugFix** Removed default forced cppStandard c++14
  - You must set this extensions's cppStandard setting if you want to force a standard
  - Reset your project to remove the old forced cppStandard

- **BugFix** Removed unnecessary -include to -FI fix for MSVC Intellisense (Was only a bug in an old Insiders build)
  - There was also a scenario where this bug fix could wrongly fix something if intelliSenseMode was set incorrectly
- Added more cppStandard options gnu++14 and gnu++17


## [1.4.1] 2021-3-27
- **BugFix**: Removed real time fix for missing Source/Header file
    - This could compete with the Unreal Editor with undesirable results
    - I now just give a message to restart VSCode. Restarting will fix the Intellisense errors for the new files.
- Temporarily disable Intellisense while extension is running
- Message window with progress bar while extension is running

## [1.3.0] 2021-3-26
- Fixed weird bug with invalid preinclude path with the sharedPCH.* header
- Fixed incorrect preinclude flag for MSVC Intellisense
- code: Fixed 4.26 Optimization fix regex to work with MSVC preinclude flag

## [1.2.0] 2021-3-22
- Added real time detection of new source/header files. Will auto add to Compile Commands.
- Added launch.json fix for deprecated externalConsole setting.

## [1.1.0] 2021-3-17
- Added real time detection of a UE4 project reset. Extension will run after detection.

## [1.0.0] 2021-3-2
- Added 4.26.1 support and removed 4.26.0 support
- 4.26.1+ now adds missing source/header files to compile commands.
- Added fix for wrong cppStandard setting.
- Changed invalid paths to fix response file instead of compile commands.
- Simplified settings.
- code: Major rewrite using classes and cleaner code.
- code: Fixed creating RegExp from string if there were no flags set

## [0.9.6] 2021-1-23
- Removed General Paths option
   - Caused some Intellisense errors in certain files
   - Shouldn't affect any fix since this setting was optional

## [0.9.5] 2021-1-23

- forced includes now pulls from compile commands (4.26)
- changed ue4 c_cpp_properties.json to be %100 free of main project references (4.26)
- changed user settings to more simplified and readable
    - This is a breaking change. It changes setting names.
- added a 4.25/4.26 fix that greatly reduces Tag Parser cache size (helps tag parser performance)
    - doesn't affect Intellisense performance unfortunately
- added backup Intellisense for Main Project folder (4.26)
- added Converter Fix option 4.26 compile commands to 4.25 Intellisense include paths
- added Temp statusbar indicator that links to logs
- code: Big refactor
- code: Changed Model class to a more specific class dealing with c_cpp_properties
- code: Fixed getUE4Folder returning wrong value
- code: Renamed some files to camelCase (I removed some other files)
- code: Quality and readability improvements.

## [0.9.0] 2021-1-7

- added 4.25 support
- added better logging if fix isn't enabled

## [0.8.1] 2021-1-6

- Added try/catch around some await functions
- Switched to workspaceContains Activation Event
- Fixed repository url in packgage.json

## [0.8.0] 2021-1-6

- Added support for Unreal Engine 4.26

### [FUTURE]
- Add tests... I only just started learning tests in python before starting Unreal Engine stuff again.
  I do see how needed they are, even with this small project. Maybe another extension.