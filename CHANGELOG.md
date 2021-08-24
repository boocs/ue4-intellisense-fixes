### [TODO]


## [2.1.0] 2021-8-24
- **Fixed** 4.27 New compiler path bug. It's using full path in compile command files when it shouldn't.
- **Fixed** Regex for response file include paths for 4.27.0 compatibility
- **Fixed** UE4 compile command weren't getting loaded for pontential fixing (needed if optional fixes were turned off)
- Removed auto disable/enable of intellisense (could interfere with other extensions)

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