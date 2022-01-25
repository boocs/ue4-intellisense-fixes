/**
 * Override for console so it shows console messages for both developer and user
 */

import * as vscode from 'vscode';
import { EXTENSION_NAME } from './consts';

export const outputChannel = vscode.window.createOutputChannel(EXTENSION_NAME);

// If debugging set this to true;
const IS_DEBUG = false;

export function log(message: string) {
    if(IS_DEBUG){  console.log(message); }

    if(!outputChannel){
        return;
    }
    
    outputChannel.appendLine(message);
}

export function error(message: string) {
    if(IS_DEBUG){  console.error(message); }

    if(!outputChannel){
        return;
    }

    outputChannel.appendLine("** Error **: ".concat(message));
    outputChannel.show();
}
