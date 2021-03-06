import { logInternalError } from 'dbux-common/src/log/logger';


export default class Stack {
  /**
   * @returns {Stack}
   */
  static allocate() {
    // TODO: use pool
    return new Stack();
  }

  /**
   * @type {number[]}
   */
  _stack = [];
  /**
   * @type {Set}
   */
  _poppedButStillAround;
  _waitCount = 0;
  _peekIdx = -1;

  getUnpoppedCount() {
    const poppedCount = this._poppedButStillAround && this._poppedButStillAround.size || 0;
    return this._stack.length - poppedCount;
  }

  isPoppedButStillAround(contextId) {
    return this._poppedButStillAround && this._poppedButStillAround.has(contextId) || false;
  }

  hasWaiting() {
    return !!this._waitCount;
  }

  getDepth() {
    return this._stack.length;
  }

  getPeekIndex() {
    // return this.getUnpoppedCount() - this._waitCount;
    return this._peekIdx;
  }

  isAtPeek(contextId) {
    return this.peek() === contextId;
  }

  isAtTop(contextId) {
    return this.top() === contextId;
  }

  top() {
    return this._stack[this._stack.length - 1] || null;
  }

  peek() {
    return this._stack[this._peekIdx] || null;
  }

  isPeekTop() {
    return this._peekIdx === this._stack.length;
  }

  indexOf(contextId) {
    return this._stack.indexOf(contextId);
  }

  push(x) {
    // insert at peek
    this._stack.splice(++this._peekIdx, 0, x);
  }

  resumeFrom(contextId) {
    this._peekIdx = this._stack.indexOf(contextId);
  }

  popTop() {
    const contextId = this.top();
    this._stack.pop();
    this._peekIdx = this._stack.length - 1;

    if (this._poppedButStillAround) {
      this._poppedButStillAround.delete(contextId);

      // remove anything lingering at the top that has been popped before
      if (this._poppedButStillAround.has(this.peek())) {
        return this.popTop();
      }
    }
    return this._stack.length;
  }

  popPeekNotTop() {
    const peekContextId = this.peek();
    --this._peekIdx;

    // we cannot actually remove this because it is technically still around
    //    (even though, it technically was "popped")
    if (!this._poppedButStillAround) {
      this._poppedButStillAround = new Set();
    }
    this._poppedButStillAround.add(peekContextId);
    return this._peekIdx + 1;
  }

  /**
   * `contextId` is not at `top` and not at `peek`:
   * Keep it around, but "mark" it as popped.
   */
  popOther(contextId) {
    const i = this.indexOf(contextId);

    if (i >= 0) {
      this._peekIdx = i;
      this.popPeekNotTop();
    }
    return i;
  }

  skipPopAtPeek() {
    
  }

  trySetPeek(contextId) {
    if (this.peek() === contextId) {
      return;
    }
    const i = this.indexOf(contextId);
    if (i < 0) {
      logInternalError('setPeek failed: contextId not on stack', contextId);
      return;
    }
    this._peekIdx = i;
  }

  markWaiting() {
    ++this._waitCount;
  }

  markResumed() {
    --this._waitCount;
  }
}