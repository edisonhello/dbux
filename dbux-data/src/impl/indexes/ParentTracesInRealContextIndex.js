import ExecutionContext from 'dbux-common/src/core/data/ExecutionContext';
import ExecutionContextType from 'dbux-common/src/core/constants/ExecutionContextType';
import Trace from 'dbux-common/src/core/data/Trace';
import CollectionIndex from '../../indexes/CollectionIndex';
import DataProvider from '../../DataProvider';


export default class ParentTracesInRealContextIndex extends CollectionIndex<Trace> {
  constructor() {
    super('traces', 'parentsByRealContext', false);
    this.added = new Set();
  }

  dependencies = {

    // NOTE: we are currently solving index dependencies by simply adding depdendents after dependees
    // indexes: [
    //   ['traces', 'byStaticTrace'],
    //   ['staticTraces', 'byFile']
    // ],

    collections: {
      executionContexts: {
        added: (contexts: ExecutionContext[]) => {
          for (const context of contexts) {
            const { parentTraceId, contextType } = context;
            if (contextType === ExecutionContextType.Await) continue;
            if (parentTraceId && !this.added.has(parentTraceId)) {
              this.addEntryById(parentTraceId);
              this.added.add(parentTraceId);
            }
          }
        }
      }
    }
  }

  makeKey(dp: DataProvider, { traceId }: Trace) {
    return dp.util.getRealContextId(traceId);
  }
}