/**
 * Override for console so it shows console messages for both developer and user
 */

import * as vscode from 'vscode';
import { EXTENSION_NAME } from './consts';

export const outputChannel = vscode.window.createOutputChannel(EXTENSION_NAME);

export function log(message: string) {
    console.log(message);

    outputChannel.appendLine(message);
}

export function error(message: string) {
    console.error(message);

    outputChannel.appendLine(message);
    outputChannel.show();
}
