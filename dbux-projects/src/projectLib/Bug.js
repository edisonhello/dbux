import path from 'path';

export default class Bug {
  project;
  
  testFilePaths;
  id;
  title;
  description;

  /**
   * Can be used to provide even more information about the bug.
   * E.g. BugsJs provides discussion logs of developers revolving around the bug.
   */
  moreDetails;

  hints; // TODO
  difficulty; // TODO!

  constructor(project, cfg) {
    Object.assign(this, cfg);
    this.project = project;
  }

  get debugTag() {
    return `${this.project} (bug #${this.id})`;
  }

  get manager() {
    return this.project.manager;
  }

  async openInEditor() {
    // open file (if any)
    if (this.testFilePaths[0]) {
      const fpath = path.join(this.project.projectPath, this.testFilePaths[0]);
      await this.manager.externals.editor.openFile(fpath);
    }
  }
}