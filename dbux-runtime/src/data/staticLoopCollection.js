import { logInternalError } from 'dbux-common/src/log/logger';
import Collection from './Collection';

/**
 * 
 */
class StaticLoopCollection extends Collection {
  /**
   * @type {[]}
   */
  _staticLoopsByProgram = [null];

  constructor() {
    super('staticLoops');
  }

  addLoops(programId, list) {
    // make sure, array is pre-allocated
    for (let i = this._staticLoopsByProgram.length; i <= programId; ++i) {
      this._staticLoopsByProgram.push(null);
    }

    // store static loops
    this._staticLoopsByProgram[programId] = list;

    for (let i = 1; i < list.length; ++i) {
      const entry = list[i];
      console.assert(entry._loopId === i);

      // global id over all programs
      entry.staticLoopId = this._all.length;
      delete entry._loopId;

      this._all.push(entry);

      // -> send out
      this._send(entry);
    }
  }

  getLoops(programId) {
    return this._staticLoopsByProgram[programId];
  }

  getLoop(programId, inProgramStaticId) {
    const loops = this.getLoops(programId);
    if (!loops) {
      logInternalError("Invalid programId has no registered static loops:", programId);
      return null;
    }
    return loops[inProgramStaticId];
  }

  getStaticLoopId(programId, inProgramStaticId) {
    const staticLoop = this.getLoop(programId, inProgramStaticId);
    return staticLoop.staticLoopId;
  }
}

const staticLoopCollection = new StaticLoopCollection();
export default staticLoopCollection;