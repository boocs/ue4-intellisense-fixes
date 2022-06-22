
import * as vscode from "vscode";

import type { Fixable } from "./extension/fixable";
import { V425Fixable } from "./extension/V425fixable";
import { V427Fixable } from "./extension/V427fixable";
import { ProjectUE4 } from "./project/projectUE4";
import * as consts from "./consts";
import * as shared from "./shared";
import * as path from "path";

import * as text from "./text";

import * as console from "./console";

const EXTENSION_VERSION = "3.1.4";

let newFileWatcher: vscode.FileSystemWatcher | undefined;
let resetEventFileWatcher: vscode.FileSystemWatcher | undefined;


export async function activate(context: vscode.ExtensionContext) {
	console.resetCounts(); // just to be sure

	// This is a workaround because the glob activation event sometimes didn't work
	// For some people it was really bad
	const hasUProjectFile: boolean = await workspaceHasUprojectFile();
	if(hasUProjectFile === false) {
		console.log('No *.uproject file found!');
		return;
	}
	else if(hasUProjectFile === true) {
		console.log('*.uproject file was found!');
	}
	else {
		console.log("Bad return from workspaceHasUprojectFile()");
		return;
	}

	console.log(`\nExtension "UE Intellisense Fixes" ${EXTENSION_VERSION} is now active!\n`);

	context.subscriptions.push(vscode.commands.registerCommand("UEIntellisenseFixes.showLog", () => {
		console.outputChannel?.show(true);
	}
	));

	const statusItem: vscode.StatusBarItem = createAndShowMainStatusItem();

	// Don't add a command to run fixes. This must run on startup to run the fixes before Tag Parser starts adding unneeded symbols to cache.
	//const fixableProject = await runExtensionWithProgress();
	const fixableProject = await runExtensionNoProgress();
	
	if (fixableProject?.project?.isValid) {
		createWatchers(fixableProject);
	}
	else {
		console.error("Couldn't create file watchers!")
	}
	
	
	
	console.log(`\n*** Number of error messages: ${console.getErrorCount()}`);
	console.log(`*** Number of warning messages: ${console.getWarningCount()}`)
	console.log("If you get any errors you can try restarting VSCode to check if they've been fixed.")
	console.outputChannel.show(true);
	

	await endRun(statusItem);
	
	
}


export function deactivate() {

	console.outputChannel?.dispose();
	resetEventFileWatcher?.dispose();
}

// Check if any workspace has a uproject file
async function workspaceHasUprojectFile() : Promise<boolean> {
	console.log('Searching for *.uproject file...');

	const foundFile = await shared.findFiles(consts.GLOB_ANY_UPROJECT_IN_TOPLEVEL, null, 1);

	if(!foundFile?.length) {
		return false;
	}
	
	return true;
}

async function runExtensionNoProgress(): Promise<Fixable | undefined> {
	const fixableProject = await getFixableProject();

	if (!fixableProject) {
		console.error("No fixable project could be created.\n");
		return;
	}
	
	await fixableProject.execFixes();
	
	return fixableProject;
}

async function runExtensionWithProgress(): Promise<Fixable | undefined> {

	return await vscode.window.withProgress(
		{
			location: vscode.ProgressLocation.Notification,
			title: "\nIntellisense Fix Extension!\n",
			cancellable: false
		}
		, async (progress, token) => {

			progress.report({ increment: 0, message: text.PLEASE_WAIT_INTELLISENSE_FIXES });

			let fixableProject: Fixable | undefined;
			try {
				fixableProject = await getFixableProject();
			}
			catch {
				return;
			}
			progress.report({ increment: 30, message: text.PLEASE_WAIT_INTELLISENSE_FIXES });


			try {

				if (!fixableProject) {
					console.error("No fixable project could be created.\n");
				}
				else {
					await fixableProject.execFixes();
				}
			}
			catch {
				// This should never hit			
				return undefined;
			}
			progress.report({ increment: 40, message: text.PLEASE_WAIT_INTELLISENSE_FIXES });


			
			progress.report({ increment: 30, message: text.PLEASE_WAIT_INTELLISENSE_FIXES });
			return fixableProject;

		});

}

function createAndShowMainStatusItem(): vscode.StatusBarItem {
	const statusItem = vscode.window.createStatusBarItem(consts.MAIN_STATUS_ALIGN, consts.MAIN_STATUS_PRIORITY);
	statusItem.text = consts.MAIN_STATUS_TEXT_FIXING;
	statusItem.command = consts.MAIN_STATUS_COMMAND;
	statusItem.show();

	return statusItem;
}


function getFixesEnabledSettings(): { isFixesEnabled: boolean, isOptionalFixesEnabled: boolean } {
	const extensionSettings = vscode.workspace.getConfiguration(consts.CONFIG_SECTION_EXTENSION);

	const isFixesEnabled = extensionSettings.get(consts.CONFIG_SETTING_ENABLE_FIXES, false);
	const isOptionalFixesEnabled = extensionSettings.get(consts.CONFIG_SETTING_ENABLE_OPTIONAL_FIXES, false);

	return { isFixesEnabled: isFixesEnabled, isOptionalFixesEnabled: isOptionalFixesEnabled };
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

	if (!version) {
		console.error("Couldn't parse Unreal Engine version.");
		return;
	}

	console.log(`Found Unreal Engine v${version.major}.${version.minor}.${version.patch}\n`);

	if (version.major === 4 ){
		if (version.minor === 25) {
			return new V425Fixable(fixesEnabledSettings.isFixesEnabled, fixesEnabledSettings.isOptionalFixesEnabled);
		}
		else if (version.minor === 26) {
	
			if (version.patch > 0) {
				return new V427Fixable(fixesEnabledSettings.isFixesEnabled, fixesEnabledSettings.isOptionalFixesEnabled);
			}
			else { // We don't support 4.26.0
				console.log("Unreal Engine version 4.26.0 is no longer supported.");
				return;
			}
		}
		else if (version.minor === 27) {
			return new V427Fixable(fixesEnabledSettings.isFixesEnabled, fixesEnabledSettings.isOptionalFixesEnabled);
		}
	}
	else if(version.major === 5 ){
		return new V427Fixable(fixesEnabledSettings.isFixesEnabled, fixesEnabledSettings.isOptionalFixesEnabled);
	}
	
	return;
}


// TODO testing making this async to try to fix buggy startup
function createWatchers(fixableProject: Fixable) {

	const mainWorkspace = fixableProject?.project.mainWorkspaceFolder;

	resetEventFileWatcher = createFileWatcher(mainWorkspace, consts.GLOB_PROJECT_RESET_FILE_CREATION, { create: true, change: false, delete: true });
	newFileWatcher = createFileWatcher(mainWorkspace, consts.GLOB_ALL_HEADERS_AND_SOURCE_FILES, { create: false, change: true, delete: true });

	resetEventFileWatcher?.onDidChange(e => {	

		console.log("Detected reset!");
		console.log("WARNING: Restart VSCode to fix Intellisense errors.\n");

		console.outputChannel?.show(true);

		vscode.window.showInformationMessage("Detected project reset. Restart VSCode to fix Intellisense errors!", text.OK);
	});

	newFileWatcher?.onDidCreate(uri => {

		const filePath = path.parse(uri.fsPath);
		const fileName = filePath.base;

		console.log(`\nWARNING: Detected new file (${fileName}).`);
		console.log("WARNING: Restart VSCode to fix new file Intellisense errors.\n");

		console.outputChannel?.show(true);
		
		vscode.window.showInformationMessage("New Soure/Header files detected: Restart VSCode if you get Intellisense errors with these new files.  This extension will add them to the appropriate file on startup.", text.OK);
		
	});
}

function createFileWatcher(workspaceFolder: vscode.WorkspaceFolder, glob: string, ignore: { create: boolean, change: boolean, delete: boolean }): vscode.FileSystemWatcher | undefined {
	const relPattern = new vscode.RelativePattern(workspaceFolder, glob);

	return vscode.workspace.createFileSystemWatcher(relPattern, ignore.create, ignore.change, ignore.delete);
}

/*
async function disableDefaultIntellisense(): Promise<void> {


	let workspacesWithWorkspaceFile: vscode.WorkspaceFolder[] = await getworkspacesWithWorkspaceFile();

	if (!workspacesWithWorkspaceFile.length) {
		return;
	}

	for (const workspace of workspacesWithWorkspaceFile) {

		const config = vscode.workspace.getConfiguration("C_Cpp", workspace);

		await config.update(consts.CONFIG_SETTING_INTELLISENSE_ENGINE, consts.CONFIG_SETTING_INTELLISENSE_ENGINE_TAG_PARSER, false);

	}

	try {
		await vscode.commands.executeCommand('C_Cpp.PauseParsing');
	}
	catch {
		// do nothing
	}

	console.log("Temporarily disabling Intellisense.\n");
	await delay(consts.INTELLISENSE_ENABLE_DISABLE_DELAY);
	return;
}


async function enableDefaultIntellisense() {
	console.log("Reenabling Intellisense.\n");
	await delay(consts.INTELLISENSE_ENABLE_DISABLE_DELAY);

	try {
		await vscode.commands.executeCommand('C_Cpp.ResumeParsing');
	}
	catch {
		// do nothing
	}

	let workspacesWithWorkspaceFile: vscode.WorkspaceFolder[] = await getworkspacesWithWorkspaceFile();

	if (!workspacesWithWorkspaceFile.length) {
		return;
	}

	for (const workspace of workspacesWithWorkspaceFile) {

		const config = vscode.workspace.getConfiguration("C_Cpp", workspace);

		await config.update(consts.CONFIG_SETTING_INTELLISENSE_ENGINE, undefined, false);
	}
}


async function hasWorkspaceFile(workspace: vscode.WorkspaceFolder): Promise<boolean> {

	const relPattern = new vscode.RelativePattern(workspace, consts.GLOB_WORKSPACE_FILE);

	const foundFile = await vscode.workspace.findFiles(relPattern);

	if (!foundFile.length) {
		return false;
	}
	else {
		return true;
	}
}

async function getworkspacesWithWorkspaceFile(): Promise<vscode.WorkspaceFolder[]> {
	const workspaces = vscode.workspace.workspaceFolders;
	if (!workspaces) {
		return [];
	}

	let workspacesWithWorkspaceFile: vscode.WorkspaceFolder[] = [];
	for (const workspace of workspaces.values()) {
		if (await hasWorkspaceFile(workspace)) {
			workspacesWithWorkspaceFile.push(workspace);
		}
	}

	return workspacesWithWorkspaceFile;
}
*/
