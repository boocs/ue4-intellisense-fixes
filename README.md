## VSCode/UE Intellisense Fix

VSCode Extension supports Unreal Engine **v4.25** / **v4.26.1+** / and **v5.0.0+**

### ReadMe link:

### [More Detailed Readme](https://gist.github.com/boocs/f63a4878156295b6e854cac68672f305)

**Note:** Check out the Running section of the Readme to take advantage of the smaller Tag Parser cache

---
### 2.1.1 October 12th, 2021
- Fixed bug that didn't allow any version after 4.27.0 to be fixed

### 2.1.0 August 24th, 2021
- **Fixed** 4.27 New compiler path bug 
- **Fixed** Regex for response file include paths for 4.27.0 compatibility
- **Fixed** UE4 compile command weren't getting loaded for pontential fixing
- Removed auto disable/enable of intellisense (could interfere with other extensions)

### 2.0.1 July 3rd, 2021
- **Fixed** Security fix by updating dependencies
- Small change to support Plugin development.

### 2.0.0 May 26th, 2021
- Update for UE5 support
- Updated setting names to be more general (will need to reenable fixes)

### 1.6.0 May 25th, 2021
- Update allows fixes to work on all configs instead of only the first one (c_cpp_properties.json). 
