
import * as vscode from "vscode";

import { CCResponseFixable } from "./extension/CCResponseFixable";
import type { Fixable } from "./extension/fixable";
import { V425Fixable } from "./extension/V425fixable";
import { ProjectUE4 } from "./project/projectUE4";
import * as consts from "./consts";
import { delay } from "./shared";

import * as console from "./console";
import { fixMissingResponseCompileCommands } from "./extension/fixes/missingCompileCommands";
import * as text from "./text";

let newFileWatcher: vscode.FileSystemWatcher | undefined;
let resetEventFileWatcher: vscode.FileSystemWatcher | undefined;
let isExtensionRunning = false;

export async function activate(context: vscode.ExtensionContext) {
	console.log('Extension "UE4 Intellisense Fixes" is now active!\n');

	context.subscriptions.push(vscode.commands.registerCommand("UE4IntellisenseFixes.showLog", () => {
		console.outputChannel?.show(true);
	}
	));

	const statusItem: vscode.StatusBarItem = createAndShowMainStatusItem();

	// Don't add a command to run fixes. This must run on startup to run the fixes before Tag Parser starts adding unneeded symbols to cache.
	const fixableProject = await runExtension();

	if (fixableProject) {
		createWatchers(fixableProject);
	}

	await endRun(statusItem);
}


export function deactivate() {

	console.outputChannel?.dispose();
	resetEventFileWatcher?.dispose();
}

async function runExtension(): Promise<Fixable | undefined> {

	return await vscode.window.withProgress(
		{
			location: vscode.ProgressLocation.Notification,
			title: "\nIntellisense Fix Extension!\n",
			cancellable: false
		}
		, async (progress, token) => {

			progress.report({ increment: 0, message: text.PLEASE_WAIT_INTELLISENSE_FIXES });

			await disableDefaultIntellisense();

			let fixableProject: Fixable | undefined;
			try {
				fixableProject = await getFixableProject();
			}
			catch {
				await enableDefaultIntellisense();
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
				// This should never hit but just in case we always want to remove the setting.
				await enableDefaultIntellisense();
				return undefined;
			}
			progress.report({ increment: 40, message: text.PLEASE_WAIT_INTELLISENSE_FIXES });


			await enableDefaultIntellisense();
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
	await delay(consts.MAIN_STATUS_LIFE);

	statusItem.dispose();

	return;
}


async function getFixableProject(): Promise<Fixable | undefined> {

	await ProjectUE4.loadUE4Version();
	const version = ProjectUE4.ue4VersionObject;

	const fixesEnabledSettings = getFixesEnabledSettings();

	if (!version) {
		console.error("Couldn't parse Unreal Engine version.");
		return;
	}

	console.log(`Found Unreal Engine v${version.major}.${version.minor}.${version.patch}\n`);

	if (version.major !== 4) {
		return;
	}

	if (version.minor === 25) {
		return new V425Fixable(fixesEnabledSettings.isFixesEnabled, fixesEnabledSettings.isOptionalFixesEnabled);
	}
	else if (version.minor === 26) {

		if (version.patch > 0) {
			return new CCResponseFixable(fixesEnabledSettings.isFixesEnabled, fixesEnabledSettings.isOptionalFixesEnabled);
		}
		else { // We don't support 4.26.0
			console.log("Unreal Engine version 4.26.0 is no longer supported.");
			return;
		}
	}

	return;
}


function createWatchers(fixableProject: Fixable) {

	const mainWorkspace = fixableProject?.project.mainWorkspaceFolder;

	resetEventFileWatcher = createFileWatcher(mainWorkspace, consts.GLOB_PROJECT_RESET_FILE_CREATION, { create: true, change: false, delete: true });
	newFileWatcher = createFileWatcher(mainWorkspace, consts.GLOB_ALL_HEADERS_AND_SOURCE_FILES, { create: false, change: true, delete: true });

	resetEventFileWatcher?.onDidChange(async e => {
		if (isExtensionRunning) {
			return;
		}
		isExtensionRunning = true;

		console.log("Detected reset. About to run extension.\n");
		await delay(consts.FILE_WATCHER_EXEC_WAIT);

		await runExtension();

		isExtensionRunning = false;
	});

	newFileWatcher?.onDidCreate(async uri => {
		console.log("Detected new file!\n");

		vscode.window.showInformationMessage("New Soure/Header files detected: Restart VSCode if you get Intellisense errors with these new files.  This extension will add them to the appropriate file on startup.", text.OK);
		// const version = ProjectUE4.ue4VersionObject;

		// if (!version) {
		// 	return;
		// }

		// if (version.minor > 25 && version.patch > 0) {
		// 	await delay(consts.FILE_WATCHER_EXEC_WAIT);
		// 	fixMissingResponseCompileCommands(fixableProject.project, uri);
		// }

	});
}

function createFileWatcher(workspaceFolder: vscode.WorkspaceFolder, glob: string, ignore: { create: boolean, change: boolean, delete: boolean }): vscode.FileSystemWatcher | undefined {
	const relPattern = new vscode.RelativePattern(workspaceFolder, glob);

	return vscode.workspace.createFileSystemWatcher(relPattern, ignore.create, ignore.change, ignore.delete);
}


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
