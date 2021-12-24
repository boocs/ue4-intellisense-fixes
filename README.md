## VSCode/UE Intellisense Fix

VSCode Extension supports Unreal Engine **v4.25** / **v4.26.1+** / and **v5.0.0+**

### ReadMe link:

### [More Detailed Readme](https://gist.github.com/boocs/f63a4878156295b6e854cac68672f305)

**Note:** Check out the Running section of the Readme to take advantage of the smaller Tag Parser cache

---
### 2.2.0 December 23rd, 2021
- (4.27+/5.0+) Changed the way compiler path was getting fixed in compile command files.
- (4.27+/5.0+) Added clang-cl.exe intellisense support to Windows. Add clang-cl.exe path to the cpptools extension User's compilerPath setting to use. 
- Fixed an error message not getting logged
- UE 5.0+ now uses compiler path fix that 4.27 uses

### 2.1.2 October 18th, 2021
- Allow cancelling all response file choices of missing compile commands  by [seesemichaelj](https://github.com/seesemichaelj)

**Thanks!**

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
