import TraceType, { isCallbackRelatedTrace } from 'dbux-common/src/core/constants/TraceType';
import EmptyArray from 'dbux-common/src/util/EmptyArray';
import { makeContextLabel } from './contextLabels';
import allApplications from '../applications/allApplications';

function makeTraceContextLabel(trace, application) {
  const context = application.dataProvider.collections.executionContexts.getById(trace.contextId);
  return makeContextLabel(context, application);
}

function makeTypeNameLabel(traceId, application) {
  const traceType = application.dataProvider.util.getTraceType(traceId);
  const typeName = TraceType.nameFrom(traceType);
  return `[${typeName}]`;
}

function makeCalleeTraceLabel(trace, application) {
  const dp = application.dataProvider;
  const { traceId } = trace;
  if (dp.util.isTraceArgument(traceId)) {
    const calleeTrace = dp.util.getCalleeStaticTrace(traceId);
    if (calleeTrace) {
      return `   (arg of ${calleeTrace.displayName})`;
    }
  }
  return '';
}

function makeDefaultTraceLabel(trace, application) {
  const {
    traceId,
    staticTraceId
  } = trace;

  const staticTrace = application.dataProvider.collections.staticTraces.getById(staticTraceId);
  const {
    displayName
  } = staticTrace;
  const title = displayName || makeTypeNameLabel(traceId, application);
  return `${title}${makeCalleeTraceLabel(trace, application)}`;
}

const byType = {
  [TraceType.PushImmediate](trace, application) {
    return `↳ ${makeTraceContextLabel(trace, application)}`;
  },
  [TraceType.PopImmediate](trace, application) {
    return `⤴ ${makeTraceContextLabel(trace, application)}`;
  },
  [TraceType.BeforeExpression](trace, application) {
    // const context = application.dataProvider.collections.executionContexts.getById(trace.contextId);
    return `✧ ${makeDefaultTraceLabel(trace, application)}`;
  },
  [TraceType.ExpressionResult](trace, application) {
    // const context = application.dataProvider.collections.executionContexts.getById(trace.contextId);
    return `${makeDefaultTraceLabel(trace, application)} ✦`;
  },
  [TraceType.CallArgument](trace, application) {
    // const context = application.dataProvider.collections.executionContexts.getById(trace.contextId);
    return `${makeDefaultTraceLabel(trace, application)}`;
  },
  [TraceType.CallbackArgument](trace, application) {
    // const context = application.dataProvider.collections.executionContexts.getById(trace.contextId);
    return `ƒ ${makeDefaultTraceLabel(trace, application)}`;
  },
  [TraceType.PushCallback](trace, application) {
    // const context = application.dataProvider.collections.executionContexts.getById(trace.contextId);
    // NOTE: nextTrace is inside callee
    // const nextTrace = application.dataProvider.collections.traces.getById(trace.traceId + 1);
    // return `↴ (callback) ${makeTraceContextLabel(nextTrace, application)}`;
    return `↴ƒ ${makeDefaultTraceLabel(trace, application)}`;
  },
  [TraceType.PopCallback](trace, application) {
    // const context = application.dataProvider.collections.executionContexts.getById(trace.contextId);
    // NOTE: previousTrace is inside callee
    // const previousTrace = application.dataProvider.collections.traces.getById(trace.traceId - 1);
    return `↱ƒ ${makeDefaultTraceLabel(trace, application)}`;
  },
  [TraceType.BlockStart](trace, application) {
    // const context = application.dataProvider.collections.executionContexts.getById(trace.contextId);
    return `↳`;
  },
  [TraceType.BlockEnd](trace, application) {
    // const context = application.dataProvider.collections.executionContexts.getById(trace.contextId);
    return `⤴`;
  }
};

export function makeTraceLabel(trace) {
  const {
    traceId
  } = trace;

  const application = allApplications.getById(trace.applicationId);

  let label;

  // custom by-type label
  const traceType = application.dataProvider.util.getTraceType(traceId);
  if (byType[traceType]) {
    label = byType[traceType](trace, application);
  }
  else {
    // default trace label
    label = makeDefaultTraceLabel(trace, application);
  }

  return label.trim();
}


/**
 * Returns time, relative to some time origin.
 *  TODO: get time relative to global time origin, not per-application time origin
 *      ideally: starting time of first application in set.
 */
export function getTraceCreatedAt(trace) {
  const application = allApplications.getById(trace.applicationId);
  const { createdAt, dataProvider } = application;
  const context = dataProvider.util.getTraceContext(trace.traceId);
  return (context.createdAt - createdAt) / 1000;
}

export function makeRootTraceLabel(trace) {
  const { traceId, applicationId } = trace;
  const dp = allApplications.getById(applicationId).dataProvider;
  const traceType = dp.util.getTraceType(traceId);
  let label;
  if (isCallbackRelatedTrace(traceType)) {
    label = makeTraceValueLabel(trace);
  }
  else {
    label = makeTraceLabel(trace);
  }
  return label;
}

/**
 * Make label that shows the params and return value of call trace
 * @param {Trace} trace 
 */
export function makeCallValueLabel(callTrace) {
  const { applicationId, traceId, resultId } = callTrace;
  const dp = allApplications.getById(applicationId).dataProvider;

  const args = dp.indexes.traces.byCall.get(traceId) || EmptyArray;
  const argValues = args.slice(1).map(arg => dp.util.getTraceValue(arg.traceId));
  const resultValue = resultId && dp.util.getTraceValue(resultId);
  const result = resultValue && ` -> ${resultValue}` || '';

  // TODO: why do we soemtimes not have a result?

  return `(${argValues.join(', ')})${result}`;
}

/**
 * Make label that shows the value of trace, or `callValueLabel` of call trace
 * @param {Trace} trace 
 */
export function makeTraceValueLabel(trace) {
  const { applicationId, traceId } = trace;
  const dp = allApplications.getById(applicationId).dataProvider;
  const callId = dp.util.getCalleeTraceId(traceId);
  if (callId) {
    // trace is call related
    const callTrace = dp.collections.traces.getById(callId);
    return makeCallValueLabel(callTrace);
  }
  else if (dp.util.doesTraceHaveValue(traceId)) {
    // trace has value
    return `${dp.util.getTraceValue(traceId)}`;
  }
  else {
    // default trace
    return makeTraceLabel(trace);
  }
}