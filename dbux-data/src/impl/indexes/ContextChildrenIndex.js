import ExecutionContext from 'dbux-common/src/core/data/ExecutionContext';
import CollectionIndex from '../../indexes/CollectionIndex';
import DataProvider from '../../DataProvider';


function makeKey(dp: DataProvider, context: ExecutionContext) {
  return context.parentContextId;
}


export default class ContextChildrenIndex extends CollectionIndex<ExecutionContext> {
  constructor() {
    super('executionContexts', 'children');
  }

  makeKey = makeKey
}