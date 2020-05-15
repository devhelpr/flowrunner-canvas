export interface IFlowrunnerConnector {
  registerFlowNodeObserver: (nodeName: string, observableId: string, callback: (payload: any) => void) => void;
  unregisterFlowNodeObserver: (nodeName: string, observableId: string) => void;
  updateFlowNode: () => void;
  pushFlowToFlowrunner: (flow: any) => void;
  executeFlowNode: (nodeName: string, payload: any) => void;
  modifyFlowNode: (nodeName: string, propertyName: string, value: any, executeNode: string) => void;

  getNodeExecutions: () => any[];
  getNodeExecutionsByNodeName: (nodeName: string) => any[];

  registerFlowExecutionObserver: (observableId: string, callback: () => void) => void;
  unregisterFlowExecuteObserver: (observableId) => void;

  isActiveFlowRunner: () => boolean;
}
