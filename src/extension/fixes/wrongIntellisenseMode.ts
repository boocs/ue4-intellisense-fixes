// M1 Macs have the wrong Intellisense mode set which causes errors

import * as vscode from "vscode";

import { ProjectUE4 } from "../../project/projectUE4";
import * as consts from "../../consts";
import { isMacM1, setIntellisenseMode } from "../../shared";

import * as console from "../../console";

const INTELLISENSE_MODE = "intellisenseMode"

export async function fixWrongIntellisenseMode(project: ProjectUE4) {
    console.log("Start fix wrong intellisense mode");

    const compilerConfig = vscode.workspace.getConfiguration(consts.CONFIG_SECTION_EXTENSION_COMPILER)
    if(!compilerConfig){
        console.error("Couldn't get Compiler Config!")
        return;
    }
    let intellisenseMode = compilerConfig.get<string>(INTELLISENSE_MODE);
    
    if(isMacM1() && !intellisenseMode){
        try {
            await compilerConfig.update(INTELLISENSE_MODE, consts.INTELLISENSE_MODE_APPLE_MACM1_DEFAULT)
        } catch (error) {
            console.error("Couldn't update extension setting intellisenseMode!")
            return;
        }
        
        intellisenseMode = consts.INTELLISENSE_MODE_APPLE_MACM1_DEFAULT;
        return;
    }

    if(intellisenseMode){
        setIntellisenseMode(project, intellisenseMode)
        return;
    }
    else{
        console.log("Didn't need to set intellisenseMode.")
    }

}
