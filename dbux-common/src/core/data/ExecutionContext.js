import ExecutionContextType from '../constants/ExecutionContextType';
import DataEntry from './DataEntry';

// TODO: the following code won't work with webpack since webpack runs in node, gathering all dependencies; would need more configuration parameters
// let _performance;
// if (typeof performance !== 'undefined') {
//   // browser
//   _performance = performance;
// }
// else {
//   // node
//   _performance = require('perf_hooks').performance;
// }

export default class ExecutionContext implements DataEntry {
  contextType : ExecutionContextType;
  stackDepth: number;
  contextId : number;
  staticContextId : number;
  orderId : number;
  parentContextId : number;
  schedulerId : number;

  /**
   * This is probably not necessary.
   * We can also find all children by searching for all contexts whose `schedulerId` equals this' `contextId`.
   */
  // addScheduledChild(scheduledContextId) {
  //   // this.scheduledChildren = this.scheduledChildren || [];
  //   // this.scheduledChildren.push(scheduledContextId);
  // }
}