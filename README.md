## VSCode/UE Intellisense Fix

VSCode Extension supports Unreal Engine **v4.25** / **v4.26.1+** / and **v5.0.0+**

### ReadMe link:

### [More Detailed Readme](https://gist.github.com/boocs/f63a4878156295b6e854cac68672f305)

---
**WARNING:**
  3.1.0+ changes the way this extension's 'enableOptionalFixes' optimization setting works.
  Enabling UE optimization disables red squiggle compiling for the Unreal Engine source code.
  This does not affect your project's source code (it still can have red squiggles).
  Navigation is unaffected.
  You can disable this in this extension's settings.
- File Changed: Unreal Source's .vscode/settings.json

---
**Note:** Check out the Running section of the Readme to take advantage of the smaller Tag Parser cache

---
### 3.1.4 June 22, 2022
- Fixed Mac M1 generated.h regex path tester (Not sure if it's M1 only fix or a general Mac fix)

### 3.1.3 June 20, 2022
- Added c++20 option for future or experimental projects

### 3.1.2 June 15, 2022
- Added error messages when creating compile command objects

### 3.1.1 June 14th, 2022
- Added fix for non-quoted response file paths [yggie](https://github.com/yggie) (Thanks!)
- Added some error messages for invalid projects
- Fixed the wording for the optional optimization fix

### 3.1.0 May 18th, 2022
- Simpler way for the extension's 'enableOptionalFixes' optimization setting. Now just uses Tag Parser for UE source. **SEE WARNING ABOVE**
- Added error if *.generated.h files aren't Built yet
- Added error if *.generated.h path isn't in rsp files
- Add error if using UE5 and using the wrong cppStandard
- Added info message about default cppStandard for UE4/UE5
- Better warning if UE path isn't in *.code-workspace file
- Show total # of errors/warnings messages at end of log
- Warn if using the extension's path setting without strict enabled
- Warning if project is using Source/(ProjectName)/(Public/Private) directory structure
- Launch json fix refactor.
- Launch json fix of this extension's previous launch json fix version to match console setting of UE5 to UE4

### 3.0.2 April 12th, 2022
- Response file path regex for linux (and probably Mac)

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
