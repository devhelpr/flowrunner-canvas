export enum ApplicationMode {
	Canvas = 0,
	UI
}

export interface IFlowrunnerConnector {
  registerFlowNodeObserver: (nodeName: string, observableId: string, callback: (payload: any) => void) => void;
  unregisterFlowNodeObserver: (nodeName: string, observableId: string) => void;
  updateFlowNode: () => void;
  pushFlowToFlowrunner: (flow: any) => void;
  executeFlowNode: (nodeName: string, payload: any) => void;
  modifyFlowNode: (nodeName: string, propertyName: string, value: any,  executeNode?: string, eventName? : string) => void;

  getNodeExecutions: () => any[];
  getNodeExecutionsByNodeName: (nodeName: string) => any[];

  registerFlowExecutionObserver: (observableId: string, callback: (executionEvent : IExecutionEvent) => void) => void;
  unregisterFlowExecuteObserver: (observableId) => void;

  isActiveFlowRunner: () => boolean;

  setPluginRegistry: (pluginRegistry : any) => void;
  getPluginRegistry: () => any;

  pauseFlowrunner: () => void;

  resumeFlowrunner: () => void;

  setFlowType: (flowType : string) => void;
  setAppMode: (appMode : ApplicationMode) => void;

  getAppMode: () => ApplicationMode;
}

export interface IExecutionEvent {
  name: string;
  payload: any;
}