## VSCode/UE Intellisense Fix

VSCode Extension supports Unreal Engine **v4.25** / **v4.26.1+** / and **v5.0.0+**

### v2.0.0 ReadMe link:

### [More Detailed Readme](https://gist.github.com/boocs/f63a4878156295b6e854cac68672f305)

**Note:** Check out the Running section of the Readme to take advantage of the smaller Tag Parser cache

---
### 2.0.1 July 3rd, 2021
- **Fixed** Security fix by updating dependencies
- Small change to support Plugin development.

### 2.0.0 May 26th, 2021
- Update for UE5 support
- Updated setting names to be more general (will need to reenable fixes)

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

