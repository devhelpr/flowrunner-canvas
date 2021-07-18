import { FlowEventRunner } from '@devhelpr/flowrunner';

export interface IFlowAgent {
  observables: any;
  flow?: FlowEventRunner;
  postMessage: (eventName: string, message: any) => void;
  addEventListener: (eventName: string, callback: (event: any, flowAgent: IFlowAgent) => void) => void;
  terminate: () => void;
}

export type GetFlowAgentFunction = () => IFlowAgent;
