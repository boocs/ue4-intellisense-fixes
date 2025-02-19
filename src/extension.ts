
import * as vscode from "vscode";

import type { Fixable } from "./extension/fixable";
import { V425Fixable } from "./extension/V425fixable";
import { V427Fixable } from "./extension/V427fixable";
import { ProjectUE4 } from "./project/projectUE4";
import * as consts from "./consts";
import * as shared from "./shared";
import * as pathLib from "path";

import * as text from "./text";

import * as console from "./console";

// TODO ****************************************************************
// Docs: create quick start guide
  // Tell about setting settings in Folder setting (show how to pick project folder and not Unreal folder)

const EXTENSION_VERSION = "3.8.2";

let newFileWatcher: vscode.FileSystemWatcher | undefined;
let resetEventFileWatcher: vscode.FileSystemWatcher | undefined;

let _ueVersion: { major: number; minor: number; patch: number; };


export async function activate(context: vscode.ExtensionContext) {
	console.resetCounts(); // just to be sure

	// This is a workaround because the glob activation event sometimes didn't work
	// For some people it was really bad
	const hasUProjectFile: boolean = await isUnrealProject();
	if(hasUProjectFile === false) {
		// console.log('No *.uproject file found!');
		return;
	}
	else if(hasUProjectFile === true) {
		console.log('*.uproject file was found!');
	}

	await checkForSettingsInWorkspace(consts.SETTINGS_NONE_IN_WORKSPACE);
	
	console.log(`\nExtension "UE Intellisense Fixes" ${EXTENSION_VERSION} is now active!\n`);

	context.subscriptions.push(vscode.commands.registerCommand("UEIntellisenseFixes.showLog", () => {
		console.outputChannel?.show(true);
	}
	));

	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration( async e => {
		const mainWorkspaceFolder = shared.getMainWorkspaceFolder();
		if(!mainWorkspaceFolder || !e.affectsConfiguration(consts.CONFIG_SECTION_EXTENSION, mainWorkspaceFolder)){return;}
		
		await checkForSettingsInWorkspace(consts.SETTINGS_NONE_IN_WORKSPACE);
		
	}));


	const statusItem: vscode.StatusBarItem = createAndShowMainStatusItem();

	// Don't add a command to run fixes. This must run on startup to run the fixes before Tag Parser starts adding unneeded symbols to cache.
	//const fixableProject = await runExtensionWithProgress();
	const fixableProject = await runExtensionNoProgress();
	
	if (fixableProject?.project?.isValid) {
		createWatchers(fixableProject);
	}
	else {
		console.error("Couldn't create file watchers!");
	}
	
	console.log(`\n*** Number of error messages: ${console.getErrorCount()}`);
	console.log(`*** Number of warning messages: ${console.getWarningCount()}`);
	console.log("If you get any errors you can try restarting VSCode to check if they've been fixed.");
		
	await endRun(statusItem);
	
}


export function deactivate() {

	console.outputChannel?.dispose();
	resetEventFileWatcher?.dispose();
}

// Check if any workspace has a uproject file
async function isUnrealProject(): Promise<boolean> {
	
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if(!workspaceFolders){
		console.log("No workspace folders found! Will not activate extension.");
		return false;
	}

	for (const folder of workspaceFolders) {
		if(folder.name === "UE5" || folder.name === "UE4"){ // skip UE4/UE5 folder
			continue;
		}
		const workspaceFileType = await vscode.workspace.fs.readDirectory(folder.uri);
		const hasFound = workspaceFileType.find( e => {
			return e[0].endsWith(".uproject");
		});

		if(hasFound){
			return true;
		}
	}

	return false;
}

async function runExtensionNoProgress(): Promise<Fixable | undefined> {
	const fixableProject = await getFixableProject();

	if (!fixableProject) {
		console.error("No fixable project could be created.\n");
		return;
	}
	
	await fixableProject.execFixes(_ueVersion);
	
	return fixableProject;
}


function createAndShowMainStatusItem(): vscode.StatusBarItem {
	const statusItem = vscode.window.createStatusBarItem(consts.MAIN_STATUS_ALIGN, consts.MAIN_STATUS_PRIORITY);
	statusItem.text = consts.MAIN_STATUS_TEXT_FIXING;
	statusItem.command = consts.MAIN_STATUS_COMMAND;
	statusItem.show();

	return statusItem;
}


function getFixesEnabledSettings(): { isFixesEnabled: boolean, isOptionalFixesEnabled: boolean } | undefined {
	const mainWorkspaceFolder = shared.getMainWorkspaceFolder();
	if(!mainWorkspaceFolder){
		return;
	}
	const extensionSettings = vscode.workspace.getConfiguration(consts.CONFIG_SECTION_EXTENSION, mainWorkspaceFolder);

	const isOptionalFixesEnabled = extensionSettings.get(consts.CONFIG_SETTING_ENABLE_OPTIONAL_FIXES, true);

	return { isFixesEnabled: true, isOptionalFixesEnabled: isOptionalFixesEnabled };
}


async function endRun(statusItem: vscode.StatusBarItem): Promise<void> {
	console.log("\nExtension is done.");

	statusItem.text = consts.MAIN_STATUS_TEXT_DONE;
	await shared.delay(consts.MAIN_STATUS_LIFE);

	statusItem.dispose();

	return;
}


async function getFixableProject(): Promise<Fixable | undefined> {

	await ProjectUE4.loadNodeUE4Version();
	const version = ProjectUE4.ue4VersionObject;

	const fixesEnabledSettings = getFixesEnabledSettings();
	if(!fixesEnabledSettings){
		return;
	}

	if (!version) {
		console.error("Couldn't parse Unreal Engine version.");
		return;
	}

	_ueVersion = version;

	console.log(`Found Unreal Engine v${_ueVersion.major}.${_ueVersion.minor}.${_ueVersion.patch}\n`);

	if (_ueVersion.major === 4 ){
		if (_ueVersion.minor === 25) {
			return new V425Fixable(fixesEnabledSettings.isFixesEnabled, fixesEnabledSettings.isOptionalFixesEnabled);
		}
		else if (_ueVersion.minor === 26) {
	
			if (_ueVersion.patch > 0) {
				return new V427Fixable(fixesEnabledSettings.isFixesEnabled, fixesEnabledSettings.isOptionalFixesEnabled);
			}
			else { // We don't support 4.26.0
				console.log("Unreal Engine version 4.26.0 is no longer supported.");
				return;
			}
		}
		else if (_ueVersion.minor === 27) {
			return new V427Fixable(fixesEnabledSettings.isFixesEnabled, fixesEnabledSettings.isOptionalFixesEnabled);
		}
	}
	else if(_ueVersion.major === 5 ){
		return new V427Fixable(fixesEnabledSettings.isFixesEnabled, fixesEnabledSettings.isOptionalFixesEnabled);
	}
	
	return;
}


function createWatchers(fixableProject: Fixable) {

	const mainWorkspace = fixableProject?.project.mainWorkspaceFolder;

	resetEventFileWatcher = createFileWatcher(mainWorkspace, consts.GLOB_PROJECT_RESET_FILE_CREATION, { create: true, change: false, delete: true });
	newFileWatcher = createFileWatcher(mainWorkspace, consts.GLOB_ALL_HEADERS_AND_SOURCE_FILES, { create: false, change: true, delete: true });

	resetEventFileWatcher?.onDidChange(async e => {	

		console.log("Detected reset!");
		console.log("WARNING: Restart VSCode to fix Intellisense errors.\n");

		console.outputChannel?.show(true);

		await vscode.window.showInformationMessage("Detected project reset. Restart VSCode to fix Intellisense errors!", text.OK);
	});

	newFileWatcher?.onDidCreate(async uri =>  {

		const filePath = pathLib.parse(uri.fsPath);
		const fileName = filePath.base;

		console.log(`\nWARNING: Detected new file (${fileName}).`);
		console.log("WARNING: Soft Reset Unreal project to fix new file Intellisense errors.\n");

		console.outputChannel?.show(true);
		
		await vscode.window.showInformationMessage(
			"New Soure/Header files detected: Soft Reset your Unreal project to add new files to Intellisense.",
			text.OK
		);
		
	});
}

function createFileWatcher(workspaceFolder: vscode.WorkspaceFolder, glob: string, ignore: { create: boolean, change: boolean, delete: boolean }): vscode.FileSystemWatcher | undefined {
	const relPattern = new vscode.RelativePattern(workspaceFolder, glob);

	return vscode.workspace.createFileSystemWatcher(relPattern, ignore.create, ignore.change, ignore.delete);
}

async function checkForSettingsInWorkspace(settingsToCheck: string[]) {

	const mainWorkspace = shared.getMainWorkspaceFolder();
	if(!mainWorkspace){
		return;
	}
    // Get the workspace configuration
    const workspaceConfig = vscode.workspace.getConfiguration(consts.CONFIG_SECTION_EXTENSION, mainWorkspace);

    const warnings: string[] = [ "Extension UE Intellisense Fixes Error:\n"];

    for (const setting of settingsToCheck) {
        const settingValue = workspaceConfig.inspect(setting);
        
        if (settingValue && settingValue.workspaceValue !== undefined) {
            warnings.push(`Error: '${consts.CONFIG_SECTION_EXTENSION}.${setting}' is set in your *.code-workspace file.`);
        }
    }

    if (warnings.length > 1) {  // 1 because we have the header already there.
        // Show the errors in a message box
		warnings.push("\nYou should not set extension settings in 'Workspace' config (*.code-workspace file).");
        warnings.push("When you refresh your project, to add new project files to Intellisense, these settings will be deleted.");
		warnings.push("Set these settings in your Workspace 'Folder' config instead (You can also set them manually in settings.json in .vscode folder)");
        
		await vscode.window.showErrorMessage(warnings.join('\n'), { modal: true});
	}
}