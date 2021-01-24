
import * as vscode from 'vscode';

import { CommandObject, UE4Version } from './ntypes';
import { fixNoCompiler } from './fixes/v426/noCompiler';
import { fixBackup } from './fixes/v426/backupIntell';
import { fixNoDefines } from './fixes/v425/noDefines';
import * as shared from './shared';
import { CCppPropertiesObject } from './cCppPropObject';
import * as consts from './consts';
import { fixTagIncludes } from './fixes/v425/tagIncludes';
import { CompileCommands} from './compileCommands';
import { fixInvalidPaths} from './fixes/v426/invalidPaths';

//import { CommandObject } from './ntypes';

import * as console from './console';

export async function activate(context: vscode.ExtensionContext) {
	console.log('Extension "UE4 Intellisense Fixes" is now active!');

	context.subscriptions.push(vscode.commands.registerCommand("UE4IntellisenseFixes.showLog", () => {
		console.outputChannel?.show(true);
	}
	));

	// Don't add a command to exec fixes. This must run on startup to run the fixes before Tag Parser starts adding unneeded symbols to cache.
	exec(); // TODO
}


export function deactivate() {
	if (console.outputChannel) {
		console.outputChannel.dispose();
	}
}


export async function exec() {

	const statusItem = createAndShowMainStatusItem();

	const ue4Version = await getUE4Version();

	if (ue4Version === UE4Version.none) {
		console.log("Didn't detect UE4 project.\n");
		return;
	}

	if (ue4Version === UE4Version.v426) {
		console.log("Detected UE 4.26 project.\n");
		await fixUE4Project426(ue4Version);
	}
	else if (ue4Version === UE4Version.v425) {
		console.log("Detected UE 4.25 project.\n");
		await fixUE4Project425();
	}

	statusItem.text = consts.MAIN_STATUS_TEXT_DONE;
	await shared.delay(consts.MAIN_STATUS_LIFE);

	statusItem.dispose();
	console.log("\nExtension is done.");
}


async function getUE4Version(): Promise<UE4Version> {
	const ue4WorkspaceFolder = shared.getUE4WorkspaceFolder();

	if (!ue4WorkspaceFolder) {
		return UE4Version.none;
	}

	const scopeMainWorkspace = await shared.getUE4ProjectsMainWorkspace();

	if (!scopeMainWorkspace) {
		return UE4Version.none;
	}
	const extensionSettings = vscode.workspace.getConfiguration(consts.CONFIG_SECTION_EXTENSION, scopeMainWorkspace);

	const ue4Versions = new Map<UE4Version.v425 | UE4Version.v426, string | undefined>([
		[UE4Version.v425, extensionSettings.get<string>(consts.CONFIG_SETTING_425_PATH_SUBSTRING, consts.UE4_425_DIR_FOLDER_NAME)],
		[UE4Version.v426, extensionSettings.get<string>(consts.CONFIG_SETTING_426_PATH_SUBSTRING, consts.UE4_426_DIR_FOLDER_NAME)]
	]);

	const result = Array.from(ue4Versions.keys()).find(key => {
		const pathSubstring = ue4Versions.get(key);
		if (!pathSubstring) {
			return false;
		}
		return ue4WorkspaceFolder.uri.fsPath.includes(pathSubstring);
	});

	if (!result) {
		return UE4Version.none;
	}

	return result;
}


async function fixUE4Project426(ue4Version: UE4Version) {
	const mainWorkspaceFolder = await shared.getUE4ProjectsMainWorkspace();
	const ue4WorkspaceFolder = shared.getUE4WorkspaceFolder();

	if (!mainWorkspaceFolder || !ue4WorkspaceFolder) {
		return;
	}

	const extensionSettings : vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(consts.CONFIG_SECTION_EXTENSION, mainWorkspaceFolder);

	const isCompileCommandsFixEnabled = extensionSettings.get<boolean>(consts.CONFIG_SETTING_426_ENABLE_COMPILE_COMMANDS_FIX);
	const isConverterFixEnabled = extensionSettings.get<boolean>(consts.CONFIG_SETTING_426_ENABLE_CONVERTER_FIX);
	const isGeneralIncludesEnabled = false; //extensionSettings.get<boolean>(consts.CONFIG_SETTING_426_ENABLE_GENERIC_INC, false);

	if (!isCompileCommandsFixEnabled && !isConverterFixEnabled) {
		console.log("*** No Fixes Enabled ***\n");
		return;
	}

	// Data we use
	const ue4CCppPropertiesObject = new CCppPropertiesObject(ue4WorkspaceFolder);
	const mainCCppPropertiesObject = new CCppPropertiesObject(mainWorkspaceFolder);

	const ue4CCppPropertiesCopy = await ue4CCppPropertiesObject.getObjectCopy();
	const mainCCppPropertiesCopy = await mainCCppPropertiesObject.getObjectCopy();

	const mainCompileCommands = await getCompileCommands(mainWorkspaceFolder);

	if (!ue4CCppPropertiesCopy || !mainCCppPropertiesCopy || !mainCompileCommands) {
		return;
	}

	const firstUE4Configuration = ue4CCppPropertiesCopy?.configurations?.[0];
	const firstMainConfiguration = mainCCppPropertiesCopy?.configurations?.[0];

	if (!firstMainConfiguration || !firstUE4Configuration) {
		console.error(`Error with c_cpp_properties.json configurations: ${firstMainConfiguration} , ${firstUE4Configuration} . Try resettings your project.\n`);
		return;
	}

	// We don't need to fix invalid paths if we're not using them.
	if (!isGeneralIncludesEnabled){
		//Fixes Invalid Paths in Compile Commands File
		fixInvalidPaths(mainCompileCommands, extensionSettings);
	}
	

	// Fixes Compile Command file by adding blank compiler to every command:
	if (isCompileCommandsFixEnabled && !isConverterFixEnabled) {
		console.log("Compile Command's Fix is enabled\n");

		// Make sure compile command's path is set
		firstMainConfiguration.compileCommands = await getCompileCommandsPath(mainWorkspaceFolder);
		if(!firstMainConfiguration.compileCommands){
			console.error("Couldn't set compile command's path! Try resetting your UE4 project.\n");
		}
		
		await fixNoCompiler(mainCompileCommands);
	}
	else {
		if (!isCompileCommandsFixEnabled && isConverterFixEnabled) {
			console.log("Converter Fix is enabled.\n");
		}
	}

	// Fixes wrong project
	firstUE4Configuration.name = getUE4DefaultConfigurationName(ue4Version);

	// Fixes backup intellisense
	await fixBackup(mainCCppPropertiesCopy, ue4CCppPropertiesCopy, mainCompileCommands, extensionSettings);

	// Enables Converter Fix: Removes compileCommand from main project's c_cpp_properties
	if (isConverterFixEnabled) {
		if (firstMainConfiguration) {
			firstMainConfiguration.compileCommands = undefined;
		}
		else {
			console.error("Converter fix failed! Try resetting your project and try again.\n");
			return;
		}
	}

	// Removes compileCommand from UE4 project's c_cpp_properties
	// This needs to be set with any fix so Tag Parser fix works correctly
	firstUE4Configuration.compileCommands = undefined;
	
	if (firstMainConfiguration.browse){
		// For Tag Parser fix (it should be default set to true but we make sure)
		firstMainConfiguration.browse.limitSymbolsToIncludedHeaders = true;
		// We don't give error message. If this doesn't get set we have other problems that should produce logs.
	}
	
	if (mainCompileCommands.isDirty){
		shared.writeJsonToFile(mainCompileCommands.path, mainCompileCommands.compileCommands);
		console.log(`Writing ${mainCompileCommands.path} to file`);
	}
	else{
		console.log("No need to write compile commands file. It was unchanged.");
	}

	await mainCCppPropertiesObject.writeIfNotEqual(mainCCppPropertiesCopy);
	await ue4CCppPropertiesObject.writeIfNotEqual(ue4CCppPropertiesCopy);

	return;
}


async function fixUE4Project425() {
	const mainWorkspaceFolder = await shared.getUE4ProjectsMainWorkspace();
	const ue4WorkspaceFolder = shared.getUE4WorkspaceFolder();

	if (!mainWorkspaceFolder || !ue4WorkspaceFolder) {
		return;
	}

	const extensionSettings = vscode.workspace.getConfiguration(consts.CONFIG_SECTION_EXTENSION, mainWorkspaceFolder);

	const isFixEnabled = extensionSettings.get<boolean>(consts.CONFIG_SETTING_425_ENABLE_FIX);

	// No defines fix
	if (!isFixEnabled) {
		console.log("Fix is not enabled.\n");
	}

	await fixNoDefines();
	console.log("End of No Defines.");
	
	// Tag Parser fix
	const ue4CCppProperties = new CCppPropertiesObject(ue4WorkspaceFolder);
	const ue4CCppPropertiesCopy = await ue4CCppProperties.getObjectCopy();

	await fixTagIncludes(ue4CCppPropertiesCopy, ue4WorkspaceFolder);

	await ue4CCppProperties.writeIfNotEqual(ue4CCppPropertiesCopy);
	console.log("End of Tag Includes.");

	return;
}


function createAndShowMainStatusItem(): vscode.StatusBarItem {
	const statusItem = vscode.window.createStatusBarItem(consts.MAIN_STATUS_ALIGN, consts.MAIN_STATUS_PRIORITY);
	statusItem.text = consts.MAIN_STATUS_TEXT_FIXING;
	statusItem.command = consts.MAIN_STATUS_COMMAND;
	statusItem.show();

	return statusItem;
}


function getUE4DefaultConfigurationName(ue4Version: UE4Version) {
	let name = "";

	if (ue4Version === UE4Version.v425) {
		name = "4.25";
	}
	else if (ue4Version === UE4Version.v426) {
		name = "4.26";
	}

	return `Unreal Engine ${name} Source (Default)`;
}

async function getCompileCommands(workspace: vscode.WorkspaceFolder) : Promise<CompileCommands | undefined> {

	const uprojectName = await shared.getProjectsUProjectName();
	const globCompileCommands = shared.createGlobCompileCommandFileName(uprojectName);
	
    // Only get main workspace compile commands file. Later we remove the unneeded UE4 compile commands file from being used at all.
    const compileCommandURIs: vscode.Uri[] | undefined = await shared.findVSCodeFolderFiles(workspace, globCompileCommands);
    if(!compileCommandURIs?.length){
        return;
    }
	
	let compileCommands: CommandObject[] | undefined = undefined;
	
	try { 
		compileCommands = shared.jsonParseSafe(await shared.readJsonStringFromFile(compileCommandURIs[0].fsPath));
	}
	catch {
		return undefined;
	}

	return compileCommands?.length ? new CompileCommands(compileCommandURIs[0].fsPath, compileCommands) : undefined;
}


async function getCompileCommandsPath(mainWorkspace: vscode.WorkspaceFolder) : Promise<string | undefined> {
	const projectName = await shared.getProjectsUProjectName();	
	const globCompileCommandsFile = shared.createGlobCompileCommandFileName(projectName);

	const ccFiles = await shared.findVSCodeFolderFiles(mainWorkspace, globCompileCommandsFile);

	if (!ccFiles?.length){
		console.error("Couldn't find Compile Commands file in .vscode directory. Will use includePaths instead.");
		return;
	}

	return ccFiles[0].fsPath;
}