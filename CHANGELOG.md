### [TODO]
- n/a

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