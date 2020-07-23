import { window } from 'vscode';
import { newLogger } from 'dbux-common/src/log/logger';
import { ProjectsManager } from 'dbux-projects/src';
import { registerCommand } from './commandUtil';

const logger = newLogger('projectCommands');
const { log, debug, warn, error: logError } = logger;

export function initProjectCommands(extensionContext, projectViewController) {
  registerCommand(extensionContext, 'dbuxProjectView.node.addProjectToWorkspace', (node) => {
    projectViewController.nodeAddToWorkspace(node);
  });

  registerCommand(extensionContext, 'dbuxProjectView.node.deleteProject', (node) => {
    node.deleteProject();
  });

  registerCommand(extensionContext, 'dbuxProjectView.node.stopProject', (node) => {
    projectViewController.manager.runner.cancel();
  });

  registerCommand(extensionContext, 'dbuxProjectView.node.activateBugWithDebugger', (node) => {
    projectViewController.activateBugByNode(node, true);
  });

  registerCommand(extensionContext, 'dbuxProjectView.node.activateBug', (node) => {
    projectViewController.activateBugByNode(node);
  });

  registerCommand(extensionContext, 'dbuxProjectView.node.busyIcon', (node) => {
    window.showInformationMessage('[dbux] busy now...');
  });

  registerCommand(extensionContext, 'dbuxProjectView.node.stopBug', (node) => {
    projectViewController.manager.runner.cancel();
  });

  registerCommand(extensionContext, 'dbuxProjectView.node.resetBug', async (node) => {
    await node.tryResetBug();
  });

  registerCommand(extensionContext, 'dbuxProjectView.node.showWebsite', (node) => {
    node.showWebsite?.();
  });

  registerCommand(extensionContext, 'dbux.cancelBugRunner', (node) => {
    projectViewController.manager.runner.cancel();
  });
}

/**
 * @param {ProjectsManager} projectViewController 
 */
export function initProjectUserCommands(extensionContext, projectViewController) {
}