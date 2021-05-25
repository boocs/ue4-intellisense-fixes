## VSCode/UE4 Intellisense Fix

VSCode Extension supports Unreal Engine **v4.25** and **v4.26.1+**

### v1.6.0 ReadMe link:

### [More Detailed Readme](https://gist.github.com/boocs/f63a4878156295b6e854cac68672f305)

**Note:** Check out the Running section of the Readme to take advantage of the smaller Tag Parser cache

---
### 1.6.0 May 25th, 2021
- Update allows fixes to work on all configs instead of only the first one (c_cpp_properties.json). 

### 1.5.1 May 12th, 2021
- **Fixed** Updated dependencies
- **Fixed** Added 'null' check for response file operation

### v1.5.0 April 15th, 2021
- **Fixed** Regex to read 4.26.2 cl.exe flags in response files was fixed. (In 4.26.2, cl flags use '/' instead of '-')
- **Fixed** New Source/Header fix for projects that build multiple modules. You can now select the response file for new files.
- **Fixed** UE4 workspace optimization now works with projects that build multiple modules.
- Removed the invalid Intellisense preinclude path fix since it couldn't encompass every single scenario
  - Added additional warning/info message for invalid Intellisense preinclude paths
- Added additional warnings messaging when adding new header/source files
- Added error message if response file contains only the word undefined


### v1.4.2 April 3rd, 2021
- **BugFix** Removed default forced cppStandard c++14
  - You must set this extensons's cppStandard setting if you want to force a standard
  - Reset your project to remove the old forced cppStandard

- **BugFix** Removed unnecessary -include to -FI fix for MSVC Intellisense (Was only a bug in an old Insiders build)
  - There was also a scenario where this bug fix could wrongly fix something if intelliSenseMode was set incorrectly
- Added more cppStandard options gnu++14 and gnu++17


### v1.4.1
- **BugFix**: Removed real time fix for missing Source/Header file
    - This could compete with the Unreal Editor with undesirable results
    - I now just give a message to restart VSCode. Restarting will fix the Intellisense errors for the new files.
- Temporarily disable Intellisense while extension is running
- Message window with progress bar while extension is running
  

### v1.3.0
- Fixed weird bug with invalid preinclude path with the sharedPCH.* header
- Fixed incorrect preinclude flag for MSVC Intellisense

