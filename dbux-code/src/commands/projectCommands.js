import path from 'path';
import { newLogger } from 'dbux-common/src/log/logger';
import { initDbuxProjects, ProjectsManager } from 'dbux-projects/src';
import exec from 'dbux-projects/src/util/exec';
import { registerCommand } from './commandUtil';

const logger = newLogger('projectCommands');
const { log, debug, warn, error: logError } = logger;


const cfg = {
  projectsRoot: path.join(__dirname, '../../projects')
};
const externals = {
  editor: {
    async openFile(fpath) {
      // TODO: use vscode API to open in `this` editor window
      await exec(`code ${fpath}`, logger, { silent: false }, true);
    },
    async openFolder(fpath) {
      // TODO: use vscode API to add to workspace
      await exec(`code --add ${fpath}`, logger, { silent: false }, true);
    }
  }
};

/**
 * @type {ProjectsManager}
 */
let manager;

export function initProjectCommands(extensionContext) {
  manager = initDbuxProjects(cfg, externals);

  const projects = manager.buildDefaultProjectList();
  const runner = manager.newBugRunner();

  debug(`Initialized dbux-projects. Projects folder = "${path.resolve(cfg.projectsRoot)}"`);

  async function go(debugMode) {
    // cancel any currently running tasks
    await runner.cancel();

    const project1 = projects.getAt(0);

    // activate/install project
    await runner.activateProject(project1);

    // load bugs
    const bugs = await runner.getOrLoadBugs(project1);
    const bug = bugs.getAt(0);

    // checkout bug -> activate bug
    await runner.activateBug(bug);

    // open in editor (must be after activation/installation)
    await bug.openInEditor();

    // run it!
    await runner.testBug(bug, debugMode);

    // TODO: "suggest" some first "analysis steps"?
    // future work: manage/expose (webpack) project background process
  }

  registerCommand(extensionContext, 'dbux.debugProjectBug0', async () => {
    await go(true);
  });
  registerCommand(extensionContext, 'dbux.runProjectBug0', async () => {
    await go(false);
  });
  registerCommand(extensionContext, 'dbux.cancelBugRunner', async () => {
    await runner.cancel();
  });
}