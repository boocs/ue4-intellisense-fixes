## VSCode/UE Intellisense Fix

VSCode Extension supports Unreal Engine **v4.25** / **v4.26.1+** / and **v5.0.0+**

### ReadMe link:

### [More Detailed Readme](https://gist.github.com/boocs/f63a4878156295b6e854cac68672f305)

**Note:** Check out the Running section of the Readme to take advantage of the smaller Tag Parser cache

---
### 3.0.1 April 6th, 2022 
- Changed to a different way of checking for UE's Version.h
- Changed all findFiles to fast-glob. findFiles(api function) was failing sometimes for unknown reasons.

  Thanks to @heptaspirit for helping test this!
- Converted from node read/write file to vscode api read/write file.
- Removed convoluted progress bar code (The info bar already has a 'extension is done' indicator)
- Changed reset detection - Now just warns to restart VSCode.
- Fixed isValid project code so file watchers will now run

### 2.5.0 Febuary 22th, 2022
- Fix for UE5 Preview 1's malformed json in launch.json

### 2.4.0 January 25th, 2022

- Mac M1 fix will auto set compiler path in c_cpp_properties (Can also change the path in new extension settings)
- New compiler.path setting to force compiler path in c_cpp_properties.
- New compiler.strictPath setting to force compiler.path setting in compile commands file.
- 4.26 now uses 4.27 code path. It shouldn't matter... and adds some of the new functionality to 4.26.
- Updated dependencies (security)
- Changed VSCode version compatibility version to 1.63.1+ (security)

### 2.3.1 January 17th, 2022
- Fix for startup bug not finding *.uproject file thus not starting the extension

### 2.3.0 January 10th, 2022
- Fix for Mac M1 users to change Intellisense Mode automatically (untested)
- Removed options for c++ standard not supported by UE

### 2.2.0 December 23rd, 2021
- (4.27+/5.0+) Changed the way compiler path was getting fixed in compile command files.
- (4.27+/5.0+) Added clang-cl.exe intellisense support to Windows. Add clang-cl.exe path to the cpptools extension User's compilerPath setting to use. 
- Fixed an error message not getting logged
- UE 5.0+ now uses compiler path fix that 4.27 uses

### 2.1.2 October 18th, 2021
- Allow cancelling all response file choices of missing compile commands  by [seesemichaelj](https://github.com/seesemichaelj)

**Thanks!**
