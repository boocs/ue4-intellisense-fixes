# Announcement
Please stop using this extension and Microsoft's C++ extension for Unreal code completion.

## clangd
The VSCode extension `clangd` has blazing fast code completion in comparison. I've made a VSCode extension for it:

https://github.com/boocs/unreal-clangd

You will use clangd for code completion(Intellisense) and use Microsoft's C++ extension for Building/Debugging

---

## Rider

There's also a free for non-commercial use editor made for Unreal called Rider if you want to try it:

https://www.jetbrains.com/lp/rider-unreal/


---


## VSCode/UE Intellisense Fix

VSCode Extension supports Unreal Engine **v4.25** / **v4.26.1+** / and **v5.0.0+**

## Quick Start Guide
1. Download the `vsix` file from this github. It's in the `Releases` section on the right hand side of this page (You might have to scroll up).
2. Install the extension with the vsix file (see below)

    ![image](https://gist.githubusercontent.com/boocs/876a39952d6f69c82df38d6c0aa13da1/raw/4e392ddc86997d865a7dde6cc483aa09ee12570b/vsix-install.png)

3. The extension's `fixes` are now automatically `enabled by default`. (Most users won't have to mess with settings)
4. If you do change this extension's settings make sure to use the Workspace `Folder` setting. You'll get a warning if you don't

    `Reason`: When you refresh your project, to add new project files to Intellisense, the *.code-workspace file is also refreshed which will delete any new settings added to it.
5. `Warning`: Your compiler path is saved in your project's .vscode/settings.json file. If you want to upgrade your C++ compiler make sure to delete this setting. After you install the new compiler do a project 'Refresh'.


### ReadMe link:

### [Old out-of-date detailed readme](https://gist.github.com/boocs/f63a4878156295b6e854cac68672f305)

---
**WARNING:**
  3.1.0+ changes the way this extension's 'enableOptionalFixes' optimization setting works.
  Enabling UE optimization disables red squiggle compiling for the Unreal Engine source code.
  This does not affect your project's source code (it still can have red squiggles).
  Navigation is unaffected.
  You can disable this in this extension's settings.
- File Changed: Unreal Source's .vscode/settings.json

---
## 3.8.2 Feb 18, 2025
- Warn if user sets project specific extension setting in Workspace. Most settings should go in Workspace 'Folder'.
- Fixed eslint settings
- Prevent compiler path fix from saving if compiler paths are equal
- Check if compile command setting is a string, in c_cpp_properties.json, and give error if not and tell user to Refresh project.
- Fixed eslint errors
- Most settings have been switched so you they can only be set in Workspace(bad) or Workspace Folder(good)
- Removed setting where you have to enable fixes. Fixes will run if you have the extension enabled. You can still disable optional fixes.
- Optional fixes are on by default. You can still disable them.
- Removed setting where you could choose compiler path to be global(user) or project specific

---
## 3.8.1 Dec 17, 2023
- Fixed glob, that detected new source files, so that it only detects source files in the immediate Source directory.

## 3.8.0 Nov 4, 2023
- Now says to user to soft reset project which is proper way to add new source files intellisense.
- Now uses esbuild to bundles extension (smaller download size and faster start)

## 3.7.3 Sept 6, 2023
- Cpp standard fix now supports UE 5.3+ and c++20
- Check for 5.3+ to bypass launch.json fix

## 3.7.2 Feb 15, 2023
- Only force show logs when there's an error
- More gentle log message if not Unreal project

## 3.7.1 Jan 19, 2023
- Fixed errant return, in intellisense fix, that caused intellisenseMode to only set after VSCode restart

## 3.7.0 Jan 19, 2023
- Switched String replaceAll function with replace (caused exception by not being supported by all systems with this config)
- Extension's intellisenseMode can now be set on a per project basis in Workspace settings
- Extension's Mac M1/M2 default intellisenseMode is now auto set in Workspace setting

## 3.6.0 Jan 19, 2023
- Changed reading/writing files
- Added more launch fix logs

## 3.5.2 Jan 18, 2023
- Since it now works correctly changed Mac M1/M2 intellisenseMode default to "macos-clang-arm64" (can be changed in this extension's settings)
- Fixed async/await in wrong intellisenseMode fix which fixes it
- Fixed async/await in file watchers

## 3.5.1 Jan 18, 2023
- Fixed Promise function not having await in launch.json fix


## 3.5.0 Nov 14, 2022
- Support for UE 5.1: They changed how they use compile commands(arguments instead of command)
- Will ask to overwrite compiler setting if compiler path is different in compile commands
- Compiler path setting can now be either local(project) or global (can't have both)
- Added new setting that turns on/off local(project) compiler path functionality
- Updated package-lock.json
- With 5.1, Epic includes hundreds of include directories that don't exists. We only give a warning about how many and don't attempt to fix.

## 3.4.0 Sept 5, 2022
- Changed Extension's path setting. Will now pull from compile command's path if not set. If set will set both compile command compiler path and compilerPath setting(c_cpp_properties.json).
- Removed strict setting
- Added comment about extension's compiler.path setting for Mac users. Probably needs to be set to /usr/bin/clang++ for Intellisense to work.

## 3.3.0 Aug 31, 2022
- When not using strict setting will auto copy Unreal's compiler choice to the path setting.
- Stop recommending to use the extension's strict setting(it's now an error but can stil be used). Users using the strict setting should uncheck the setting and reset their project(Generate Project Files)

### 3.2.0 Aug 18, 2022
- Changed default intellisenseMode for Mac M1 users to clang-x64
- Added editable intellisenseMode extension setting (For Mac M1 users it will be auto set to clang-x64)
- Changed default Mac M1 compiler setting to clang++ instead of clang
- Added warning for Mac users for setting UEIntellisenseFixes.compiler.path

### 3.1.6 Aug 15, 2022
- Fixed response file path regex to support dashes
- Better error message for response file regex being unable to read path

### 3.1.5 Aug 14, 2022
- Retrying Mac M1 generated.h regex path tester (Not sure if it's M1 only fix or a general Mac fix)

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
