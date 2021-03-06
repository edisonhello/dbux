import StaticTrace from 'dbux-common/src/core/data/StaticTrace';
import Trace from 'dbux-common/src/core/data/Trace';
import CollectionIndex from '../../indexes/CollectionIndex';
import DataProvider from '../../DataProvider';


export default class VisitedStaticTracesByFileIndex extends CollectionIndex<StaticTrace> {
  visited: boolean[] = [];

  constructor() {
    super('staticTraces', 'visitedByFile', false);
  }

  dependencies = {
    // NOTE: we are currently solving index dependencies by simply adding depdendents after dependees
    // indexes: [
    //   ['traces', 'byStaticTrace'],
    //   ['staticTraces', 'byFile']
    // ],

    collections: {
      traces: {
        added: (traces: Trace[]) => {
          for (const trace of traces) {
            const { staticTraceId } = trace;
            if (!this.visited[staticTraceId]) {
              // a new trace has been executed
              this.addEntryById(staticTraceId);
            }
          }
        }
      }
    }
  }

  makeKey(dp: DataProvider, staticTrace: StaticTrace) {
    const { staticTraceId } = staticTrace;
    // const traces = dp.indexes.traces.byStaticTrace.get(staticTraceId);
    // if (traces) {
    //   // filter out
    //   return false;
    // }

    this.visited[staticTraceId] = true;
    return dp.util.getStaticTraceProgramId(staticTraceId);
  }
}