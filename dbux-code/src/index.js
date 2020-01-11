import { initCommands } from './commands';
import { initCodeControl } from './codeControl';
import { initServer } from './server';
import { initTreeView } from './treeView';

import vscode from 'vscode';

const log = (...args) => console.log('[dbux-code]', ...args)

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	initCommands(context);
	initCodeControl(context);
	initServer(context);
	initTreeView(context);

}

// this method is called when your extension is deactivated
function deactivate() {
	vscode.window.showInformationMessage('Extension down');
}

export {
	activate,
	deactivate
}
