// M1 Macs have the wrong Intellisense mode set which causes errors

import * as os from "os";

import { ProjectUE4 } from "../../project/projectUE4";
import * as consts from "../../consts";
import { setIntellisenseMode } from "../../shared";

import * as console from "../../console";


export function fixWrongIntellisenseMode(project: ProjectUE4) {
    console.log("Start fix wrong intellisense mode");
    const cpuModel = os.cpus()[0].model;

    console.log(`Found: ${cpuModel}`);

    // ref: https://stackoverflow.com/questions/65146751/detecting-apple-silicon-mac-in-javascript
    if(!cpuModel.includes(consts.CPUID_MACM1)){
        console.log("Intellisense mode doesn't need to be fixed.");
        return;
    }

    setIntellisenseMode(project, consts.INTELLISENSE_MODE_MACOS_CLANG_ARM64);

}
