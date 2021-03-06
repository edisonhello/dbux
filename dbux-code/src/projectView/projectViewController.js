import { ViewColumn } from 'vscode';
import path from 'path';
import { newLogger } from 'dbux-common/src/log/logger';
import { initDbuxProjects } from 'dbux-projects/src';
import exec from 'dbux-projects/src/util/exec';
import ProjectNodeProvider from './projectNodeProvider';
import { showTextDocument } from '../codeUtil/codeNav';
import { runTaskWithProgressBar } from '../codeUtil/runTaskWithProgressBar';

const logger = newLogger('projectViewController');
const { log, debug, warn, error: logError } = logger;

let controller;

const cfg = {
  projectsRoot: path.join(__dirname, '../../projects')
};
const externals = {
  editor: {
    async openFile(fpath) {
      // await exec(`code ${fpath}`, logger, { silent: false }, true);
      return showTextDocument(fpath, ViewColumn.One);
    },
    async openFolder(fpath) {
      // TODO: use vscode API to add to workspace
      await exec(`code --add ${fpath}`, logger, { silent: false }, true);
    }
  }
};

class ProjectViewController {
  constructor(context) {
    // ########################################
    //  init projectManager
    // ########################################
    this.manager = initDbuxProjects(cfg, externals);
    debug(`Initialized dbux-projects. Projects folder = "${path.resolve(cfg.projectsRoot)}"`);

    // ########################################
    //  init treeView
    // ########################################
    this.treeDataProvider = new ProjectNodeProvider(context, this);
    this.treeView = this.treeDataProvider.treeView;
  }

  async activateBugByNode(bugNode, debugMode = false) {
    const options = {
      title: `[dbux] Activating bug:{${bugNode.bug.name}}`
    };

    runTaskWithProgressBar(async (progress, cancelToken) => {
      await this._activateBug(progress, cancelToken, bugNode, debugMode);
    }, options);
  }

  async _activateBug(progress, cancelToken, bugNode, debugMode) {
    const { bug } = bugNode;
    const runner = this.manager.getOrCreateRunner();

    // cancel any currently running tasks
    await runner.cancel();
    progress.report({ increment: 20, message: 'activating...' });

    // activate/install project
    if (cancelToken.isCancellationRequested) {
      return;
    }
    await runner.activateProject(bugNode.bug.project);
    progress.report({ increment: 40, message: 'opening in editor...' });

    // open in editor (must be after activation/installation)
    if (cancelToken.isCancellationRequested) {
      return;
    }
    await bug.openInEditor();
    progress.report({ increment: 10, message: 'running test...' });

    // run it!
    if (cancelToken.isCancellationRequested) {
      return;
    }
    await runner.testBug(bug, debugMode);
    progress.report({ increment: 30, message: 'Finished!' });
  }
}

// ###########################################################################
// init
// ###########################################################################

export function initProjectView(context) {
  controller = new ProjectViewController(context);

  // refresh right away
  controller.treeDataProvider.refresh();

  return controller;
}