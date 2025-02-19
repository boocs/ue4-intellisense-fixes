// Warn if using Public/Private directory structure
// Warning will be to reset(Generate Project Files) so UE can add paths to correct files

import * as vscode from 'vscode';

import type { ProjectUE4 } from "../../project/projectUE4";

import * as console from '../../console';
import * as shared from '../../shared';

const GLOB_PUBLIC_DIR_STRUCTURE = "Source/*/Public/*.*";
const GLOB_PRIVATE_DIR_STRUCTURE = "Source/*/Private/*.*";

export async function warnPubPrivDir(project: ProjectUE4) {

    console.log("Warning about Public/Private directory");

    const relPatternPublic = new vscode.RelativePattern(project.mainWorkspaceFolder, GLOB_PUBLIC_DIR_STRUCTURE);
    const relPatternPrivate = new vscode.RelativePattern(project.mainWorkspaceFolder, GLOB_PRIVATE_DIR_STRUCTURE);

    const relPatterns = [relPatternPublic, relPatternPrivate];
    
    for (const relPattern of relPatterns) {
        const uris = await shared.findFiles(relPattern);

        if (uris.length) {
            console.warning("Public/Private folders found in your Source directory."
                + "\n*** Make sure to reset(Generate Project Files) your project, only once, to add these folders to the correct config files.");
            return;
        }

    }

    console.log("You do not have this directory structure so no warning needed.");

}
