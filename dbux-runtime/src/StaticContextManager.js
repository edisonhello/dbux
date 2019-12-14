import StaticContext from './StaticContext';
import ProgramStaticContext from './ProgramStaticContext';

let _instance;

/**
 * Keeps track of `StaticContext` objects that contain all static code information,
 * and also manage dynamic ids for traces through their domain.
 * 
 */
export default class StaticContextManager {
  /**
   * Singleton
   * @type {StaticContextManager}
   */
  static get instance() {
    return _instance || (_instance = new StaticContextManager());
  }

  /**
   * @type {StaticContext[]}
   */
  _programStaticContexts = new Map();

  addProgram(programData) {
    const programId = `TODO`;
    const programStaticContext = new ProgramStaticContext(programId, programData);
    this._programStaticContexts.set(programId, programStaticContext);
    return programStaticContext;
  }

  /**
   * Produces an incremental id, unique in the context of the given staticContextId.
   */
  genContextId(programId, staticContextId) {
    const staticContext = this._programStaticContexts[programId];
    return staticContext.genContextId();
  }
}