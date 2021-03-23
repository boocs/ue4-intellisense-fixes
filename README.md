## VSCode/UE4 Intellisense Fix

VSCode Extension supports Unreal Engine **v4.25** and **v4.26.1+**

### v1.2.0 ReadMe link:

## [More Detailed Readme](https://gist.github.com/boocs/f63a4878156295b6e854cac68672f305)

**Note:** Check out the Running section of the Readme to take advantage of the smaller Tag Parser cache

---
### v1.2.0
- 4.26.1+ Added real time detection of new source/header files. Will auto add to Compile Commands.
- Added launch.json fix for deprecated externalConsole setting.


### v1.1.0
- Real time detection of UE4 project reset. Extension will run after detection.

### v1.0.0
#### 4.26.1+
- Fixes invalid paths in compile command's response file.
- Adds missing source/headers to compile command's file.
- Fixes UE4 workspace's Tag Parser includes to increase performance.
- Fix for wrong cppStandard and to not pollute global user setting.
- Optional fix: Removes project specific references from UE4 workspace and add general Intellisense to UE4 source code.

#### 4.25
- Fixes no defines.
- Fix for wrong cppStandard and to not pollute global user setting. 
- Fixes UE4 workspace's Tag Parser includes to increase performance.
