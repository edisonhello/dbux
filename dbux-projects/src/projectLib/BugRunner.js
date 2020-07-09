import NanoEvents from 'nanoevents';
import defaultsDeep from 'lodash/defaultsDeep';
import sh from 'shelljs';
import SerialTaskQueue from 'dbux-common/src/util/queue/SerialTaskQueue';
import Process from 'dbux-projects/src/util/Process';
import { newLogger, logError } from 'dbux-common/src/log/logger';
import EmptyArray from 'dbux-common/src/util/EmptyArray';
import Project from './Project';
import Bug from './Bug';

export default class BugRunner {
  manager;
  /**
   * @type {SerialTaskQueue}
   */
  _queue;
  /**
   * @type {Project}
   */
  _project;
  /**
   * @type {Bug}
   */
  _bug;

  debugPort = 9853;

  constructor(manager) {
    this.manager = manager;
    this._ownLogger = newLogger('BugRunner');
    this._emitter = new NanoEvents();
    this.bugActivating = 0;
  }

  get logger() {
    return this._project?.logger || this._ownLogger;
  }

  get bug() {
    return this._bug;
  }

  /**
   * Initializes things and creates new task queue.
   */
  start() {
    if (this._queue) {
      throw new Error('already running');
    }

    // make sure, `projectsRoot` exists
    const { projectsRoot } = this.manager.config;
    sh.mkdir('-p', projectsRoot);

    this._queue = new SerialTaskQueue('BugRunnerQueue');

    // TODO: synchronized methods deadlock when they call each other
    this._queue.synchronizedMethods(this, //this._wrapSynchronized,
      'activateProject',
      'activateBug',
      'testBug',
      // 'exec'
    );
  }

  // _wrapSynchronized(f) {
  //   return () => {

  //   };
  // }

  // ###########################################################################
  // public getters
  // ###########################################################################

  isBusy() {
    return this._queue.isBusy() || this._process || this._project;
  }

  isProjectActive(project) {
    return this._project === project && project._installed;
  }

  isBugActive(bug) {
    return this._bug === bug;
  }

  // ###########################################################################
  // activation methods
  // ###########################################################################

  // async _runOnProject(cb, ...args) {
  //   const project = this._project;
  //   project._runner = this;
  //   try {
  //     return cb.apply(project, ...args);
  //   }
  //   finally {
  //     project._runner = null;
  //   }
  // }

  /**
   * NOTE: synchronized.
   */
  async activateProject(project) {
    if (this.isProjectActive(project)) {
      return;
    }

    this._project = project;
    await project.installProject();
    project._installed = true;
  }

  async getOrLoadBugs(project) {
    // if (!this.isProjectActive(project)) {
    //   await this.activateProject(project);
    // }
    return project.getOrLoadBugs();
  }

  /**
   * @param {Bug} bug 
   */
  async activateBug(bug) {
    if (this.isBugActive(bug)) {
      return;
    }

    const { project } = bug;
    this._bug = bug;
    this._emitter.emit('start', bug);

    this.bugActivating += 1;

    try {    
      // activate project
      await this._activateProject(project);

      sh.cd(project.projectPath);
      if (bug.patch) {
        // git reset hard
        // TODO: make sure, user gets to save own changes first
        await project.gitResetHard();

        // activate patch
        await project.applyPatch(bug.patch);
      }

      // start watch mode (if necessary)
      await project.startWatchModeIfNotRunning();

      // select bug
      await project.selectBug(bug);
    } finally {
      this.bugActivating += -1;
      this.maybeNotifyEnd();
    }
  }

  /**
   * Run bug (if in debug mode, will wait for debugger to attach)
   * 
   * @param {}
   */
  async testBug(bug, debugMode = true) {
    const { project } = bug;

    // do whatever it takes (usually: `activateProject` -> `git checkout`)
    await this._activateBug(bug);

    let command = await bug.project.testBugCommand(bug, debugMode && this.debugPort || null);
    command = command.trim().replace(/\s+/, ' ');  // get rid of unnecessary line-breaks and multiple spaces

    if (!command) {
      // nothing to do
      project.logger.debug('has no test command. Nothing left to do.');
      // throw new Error(`Invalid testBugCommand implementation in ${project} - did not return anything.`);
      return null;
    }
    else {
      // await this._exec(project, command);
      const cwd = project.projectPath;
      this._terminalWrapper = this.manager.externals.execInTerminal(cwd, command);
      const result = await this._terminalWrapper.waitForResult();
      project.logger.log(`Result:`, result);
      return result;
    }
  }

  /**
   * @param {boolean} options.cdToProjectPath [Default=true] Whether to cd to `project.projectPath`.
   */
  async _exec(project, cmd, options = null) {
    const {
      projectPath
    } = project;

    if (this._process) {
      project.logger.error(`[possible race condition] executing command "${cmd}" while command "${this._process.command}" was already running`);
    }

    // set cwd
    let cwd;
    if (options?.cdToProjectPath !== false) {
      cwd = projectPath;

      // set cwd option
      options = defaultsDeep(options, {
        processOptions: {
          cwd
        }
      });

      // cd into it
      sh.cd(cwd);
    }

    // // wait until current process finshed it's workload
    // this._process?.waitToEnd();

    this._process = new Process();
    try {
      return await this._process.start(cmd, project.logger, options);
    }
    finally {
      this._process = null;
    }
  }

  async cancel() {
    if (!this.isBusy()) {
      // nothing to do
      return;
    }

    // cancel all further steps already in queue
    const queuePromise = this._queue.cancel();

    // kill active terminal wrapper
    this._terminalWrapper?.cancel();
    this._terminalWrapper = null;

    // kill active process
    await this._process?.kill();

    await queuePromise;

    // kill background processes
    const backgroundProcesses = this._project?.backgroundProcesses || EmptyArray;
    await Promise.all(backgroundProcesses.map(p => p.kill()));

    this._bug = null;
    this._project = null;

    // hackfix: send end event to refresh projectView
    // in the time project.backgroundProcess ends, this._project still exist, thus projectNode is activated
    this._emitter.emit('end');
  }

  maybeNotifyEnd() {
    if (this._project && !this._project.backgroundProcesses.length && !this.bugActivating) {
      this._emitter.emit('end');
    }
  }

  on(evtName, cb) {
    this._emitter.on(evtName, cb);
  }
}