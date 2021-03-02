"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectUE4 = void 0;
const vscode = require("vscode");
const path = require("path");
const fs_1 = require("fs");
const projectCCpp_1 = require("./projectCCpp");
const consts = require("../consts");
const console = require("../console");
const MAIN_KEY = "main";
const UE4_KEY = "ue4";
class ProjectUE4 extends projectCCpp_1.ProjectCCpp {
    constructor() {
        super();
        this._mainUProjectPath = "";
        this._mainUProjectName = "";
    }
    static get ue4VersionObject() {
        return ProjectUE4._ue4Version;
    }
    /**
     * @returns empty string if version hasn't been loaded
     */
    static get ue4Version() {
        const version = ProjectUE4._ue4Version;
        if (!version) {
            return "";
        }
        return `${version.major}.${version.minor}.${version.patch}`;
    }
    async ue4PostConstructionSetup(isUsedMainConfigurations, isUsedMainProperties, isUsedUE4Configurations, isUsedUE4Properties) {
        let isValid = false;
        // **** NOTE **** Some of these vars rely on creation order so can't be changed.
        this._ue4WorkspaceFolder = ProjectUE4.findUE4Workspace();
        if (!this._ue4WorkspaceFolder) {
            return false;
        }
        isValid = await this.setupUprojectVars();
        if (!isValid) {
            return false;
        }
        this._mainWorkspaceFolder = await this.findMainWorkspace();
        if (!this._mainWorkspaceFolder) {
            return false;
        }
        const mainSetupVars = { configurationsWorkspace: isUsedMainConfigurations ? this.mainWorkspaceFolder : undefined, propertiesWorkspace: isUsedMainProperties ? this.mainWorkspaceFolder : undefined };
        const ue4SetupVars = { configurationsWorkspace: isUsedUE4Configurations ? this.ue4WorkspaceFolder : undefined, propertiesWorkspace: isUsedUE4Properties ? this.ue4WorkspaceFolder : undefined };
        isValid = await super.cCppPostConstructionSetup({ [MAIN_KEY]: mainSetupVars, [UE4_KEY]: ue4SetupVars });
        if (!isValid) {
            return false;
        }
        return true;
    }
    get ue4WorkspaceFolder() {
        if (this._ue4WorkspaceFolder) {
            return this._ue4WorkspaceFolder;
        }
        else {
            throw Error("UE4 Workspace folder was not set properly."); // This shouldn't be reached if we have good valid checks
        }
    }
    get mainWorkspaceFolder() {
        if (this._mainWorkspaceFolder) {
            return this._mainWorkspaceFolder;
        }
        else {
            throw Error("Main Workspace folder was not set properly."); // This shouldn't be reached if we have good valid checks
        }
    }
    get mainUprojectPath() {
        return this._mainUProjectPath;
    }
    get mainUprojectName() {
        return this._mainUProjectName;
    }
    getFirstCCppPropertiesConfiguration(workspaceKey) {
        return super.getCCppConfiguration(workspaceKey, 0);
    }
    get mainWorkspaceKey() {
        return MAIN_KEY;
    }
    get ue4WorkspaceKey() {
        return UE4_KEY;
    }
    async setupUprojectVars() {
        const uprojectFiles = await this.findUProjectFiles();
        if (!(uprojectFiles === null || uprojectFiles === void 0 ? void 0 : uprojectFiles.length)) {
            return false;
        }
        const parsedPath = path.parse(uprojectFiles[0].fsPath);
        this._mainUProjectPath = parsedPath.dir;
        this._mainUProjectName = parsedPath.name;
        return true;
    }
    /**
    * @returns returns undefined if not found
    * @logs If can't find workspace.
    */
    static findUE4Workspace() {
        var _a;
        const ue4Workspace = (_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a.find(workspaceFolder => {
            return workspaceFolder.name === consts.WORKSPACE_FOLDER_NAME_UE4;
        });
        if (!ue4Workspace) {
            console.log("Couldn't find the UE4 workspace.");
            return;
        }
        return ue4Workspace;
    }
    /**
    * @param excludeUE4 Defaults to true
    *
    * @logs console.error When no uproject files found.
    * @todo Can exclude pattern work somehow to filter out ue4 folder? This function still works with alternate exclude using filter.
    */
    async findUProjectFiles(excludeUE4 = true) {
        let uprojectFiles;
        try {
            uprojectFiles = await vscode.workspace.findFiles(consts.GLOB_ANY_UPROJECT_IN_TOPLEVEL);
        }
        catch {
            console.error("Error finding uproject files in GetUprojectFiles()");
            return;
        }
        if (!(uprojectFiles === null || uprojectFiles === void 0 ? void 0 : uprojectFiles.length)) {
            console.error("No uproject files found.");
            return;
        }
        if (excludeUE4) {
            if (!this.ue4WorkspaceFolder) {
                console.error("UE4 Workspace Folder hasn't been set.");
                return;
            }
            try {
                uprojectFiles = await Promise.all(uprojectFiles.filter(uri => { return !uri.fsPath.includes(this.ue4WorkspaceFolder.uri.fsPath); }));
            }
            catch (error) {
                console.error("Error filtering uproject files in GetUProjectFiles(): (exclude UE4).");
                return;
            }
        }
        return uprojectFiles;
    }
    /**
    * @returns undefined if nothing could be found
    * @logs If no workspaces found or main workspace not found
    */
    async findMainWorkspace() {
        var _a;
        const mainWorkspacePath = this.mainUprojectPath;
        if (!((_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a.length)) {
            console.log("No workspaces found in getMainWorkspace");
            return;
        }
        const workspace = vscode.workspace.workspaceFolders.find(workspaceFolder => {
            return path.normalize(workspaceFolder.uri.fsPath) === path.normalize(mainWorkspacePath);
        });
        if (!workspace) {
            console.error("Main workspace not found in getMainWorkspace");
            return;
        }
        return workspace;
    }
    static async loadUE4Version() {
        const ue4Workspace = ProjectUE4.findUE4Workspace();
        if (!ue4Workspace) {
            return;
        }
        const relPattern = new vscode.RelativePattern(ue4Workspace, consts.GLOB_UE4_SOURCE_FILE_VERSION_H);
        const versionUri = await vscode.workspace.findFiles(relPattern, undefined, 1);
        if (!versionUri.length) {
            console.error("Couldn't find UE4 source file Version.h");
            return;
        }
        const versionStrings = await ProjectUE4.parseUnrealEngineVersionFrom(versionUri[0]);
        if ((versionStrings === null || versionStrings === void 0 ? void 0 : versionStrings.length) !== 3) {
            console.error("UE4 version strings weren't found.");
            return;
        }
        ProjectUE4._ue4Version = { major: parseInt(versionStrings[0]), minor: parseInt(versionStrings[1]), patch: parseInt(versionStrings[2]) };
    }
    static async parseUnrealEngineVersionFrom(uri) {
        const versionFile = await fs_1.promises.readFile(uri.fsPath, { encoding: consts.UE4_SOURCE_ENCODING });
        if (!versionFile) {
            console.error(`Error while reading file: ${uri.fsPath}`);
            return null;
        }
        const regex = new RegExp(consts.RE_UE4_VERSION, "gm");
        return versionFile.match(regex);
    }
    loadMainFirstConfigCompileCommands() {
        return this.loadCompileCommandsFromConfig(MAIN_KEY, 0);
    }
    getMainFirstConfigCompileCommands() {
        return this.getCompileCommandsAtConfigIndex(MAIN_KEY, 0);
    }
}
exports.ProjectUE4 = ProjectUE4;
ProjectUE4._ue4Version = undefined;
//# sourceMappingURL=projectUE4.js.map