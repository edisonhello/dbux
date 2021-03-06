import BaseTreeViewNode from '../codeUtil/BaseTreeViewNode';

export default class BugNode extends BaseTreeViewNode {
  static makeLabel(bug) {
    return bug.name;
  }

  init = () => {
    this.contextValue = 'BugNode';
  }

  get bug() {
    return this.entry;
  }

  canHaveChildren() {
    return false;
  }

  handleClick() {

  }
}