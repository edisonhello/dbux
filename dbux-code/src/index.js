import { newLogger } from 'dbux-common/src/log/logger';
import { window } from 'vscode';

import { initServer } from './net/server';
import { initCodeDeco } from './codeDeco';

import { initTreeView } from './treeView/treeViewController';
import { initCommands } from './commands/index';
import { initToolBar } from './toolbar';
import { initPlayback } from './playback/index';

import PlaybackController from './playback/PlaybackController';
import { initCodeApplications } from './CodeApplication';
import { initTraceDetailsController } from './traceDetailsView/traceDetailsController';
import { initResources } from './resources';


const {
  log, debug, warn, error: logError,
} = newLogger('dbux-code');


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  try {
    initResources(context);
    initServer(context);
    initCodeApplications(context);
    initCodeDeco(context);
    initTraceDetailsController(context);

    // TODO: we don't have a single DataProvider anymore - manage Applications instead
    // TODO: see codeDeco for reference
    // const treeViewController = initTreeView(context, dataProvider);
    // const playbackController = initPlayback(dataProvider, treeViewController);
    // initCommands(context, treeViewController, playbackController);
    // initToolBar(context, treeViewController);
  } catch (e) {
    logError('could not activate', e);
    // debugger;
    throw e;
  }
}

// this method is called when your extension is deactivated
function deactivate() {
  window.showInformationMessage('Extension down');
}

export {
  activate,
  deactivate,
};
