// M1 Macs have the wrong Intellisense mode set which causes errors

import * as os from "os";

import { ProjectUE4 } from "../../project/projectUE4";
import * as consts from "../../consts";
import { isMacM1, setIntellisenseMode } from "../../shared";

import * as console from "../../console";


export function fixWrongIntellisenseMode(project: ProjectUE4) {
    console.log("Start fix wrong intellisense mode");
    
    if(!isMacM1()){
        console.log("Intellisense mode doesn't need to be fixed.");
        return;
    }

    setIntellisenseMode(project, consts.INTELLISENSE_MODE_MACOS_CLANG_ARM64);

}
