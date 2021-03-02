"use strict";
/**
 * Override for console so it shows console messages for both developer and user
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.error = exports.log = exports.outputChannel = void 0;
const vscode = require("vscode");
const consts_1 = require("./consts");
exports.outputChannel = vscode.window.createOutputChannel(consts_1.EXTENSION_NAME);
function log(message) {
    console.log(message);
    exports.outputChannel.appendLine(message);
}
exports.log = log;
function error(message) {
    console.error(message);
    exports.outputChannel.appendLine("** Error **: ".concat(message));
    exports.outputChannel.show();
}
exports.error = error;
//# sourceMappingURL=console.js.map