import TraceType from '../constants/TraceType';

export default class Trace {
  contextId: number;
  staticTraceId: number;
  
  type: TraceType;
  value: any;
}