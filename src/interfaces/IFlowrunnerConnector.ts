import { IStorageProvider } from './IStorageProvider';
import { IFlowAgent } from './IFlowAgent';

export enum ApplicationMode {
  Canvas = 0,
  UI,
}

export interface IFlowrunnerConnector {
  storageProvider: IStorageProvider | undefined;
  hasStorageProvider: boolean;

  flowView: string;
  forcePushToFlowRunner: boolean;
  
  registerNodeStateObserver: (
    observableId: string,
    callback: (nodeName: string, nodeState: string, touchedNodes: any) => void,
  ) => void;
  unregisterNodeStateObserver: (observableId: string) => void;

  registerFlowNodeObserver: (nodeName: string, observableId: string, callback: (payload: any) => void) => void;
  unregisterFlowNodeObserver: (nodeName: string, observableId: string) => void;

  resetCurrentFlow: () => void;
  updateFlowNode: () => void;
  pushFlowToFlowrunner: (flow: any, autoStartNodes: boolean, flowId: string) => void;
  executeFlowNode: (nodeName: string, payload?: any) => void;
  modifyFlowNode: (
    nodeName: string,
    propertyName: string,
    value: any,
    executeNode?: string,
    eventName?: string,
    additionalValues?: any,
  ) => void;

  getNodeExecutions: () => any[];
  getNodeExecutionsByNodeName: (nodeName: string) => any[];

  registerFlowExecutionObserver: (observableId: string, callback: (executionEvent: IExecutionEvent) => void) => void;
  unregisterFlowExecuteObserver: (observableId) => void;

  isActiveFlowRunner: () => boolean;

  setPluginRegistry: (pluginRegistry: any) => void;
  getPluginRegistry: () => any;
  getTasksFromPluginRegistry: () => any[];

  pauseFlowrunner: () => void;

  resumeFlowrunner: () => void;

  setFlowType: (flowType: string) => void;
  setAppMode: (appMode: ApplicationMode) => void;

  getAppMode: () => ApplicationMode;

  registerScreenUICallback: (callback: (action: any) => void) => void;
  registerDestroyAndRecreateWorker: (onDestroyAndRecreateWorker: any) => void;
  killAndRecreateWorker: () => void;

  registerOnReceiveFlowNodeExecuteResult: (onReceiveFlowNodeExecuteResult: any) => void;

  runTests: (flowId: string) => void;
  registerWorker: (worker: IFlowAgent) => void;
}

export interface IExecutionEvent {
  name: string;
  payload: any;
}
