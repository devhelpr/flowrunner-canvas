export interface IStorageProvider {
  addFlow: (name, flow) => Promise<any>;
  getFlows: () => any[] | Promise<any[]>;
  getFlow: (flowId: string) => any | Promise<any>;
  saveFlow: (flowId: string, flow: any[]) => any | Promise<any>;
  getTasks: () => any[];
  getApiProxyUrl: () => string;
  setSelectedFlow: (flowId: string) => void;
  getSelectedFlow: () => string;
  isUI: boolean;
  setDefaultFlow?: (flowPackage: string) => void;
  setAdditionalTasks?: (tasks: any[]) => void;
  isReadOnly: boolean;
  canStoreMultipleFlows: boolean;
  isAsync: boolean;
  setFlowName: (flowId: string, flowName: string) => Promise<string>;
  getFlowName: () => string;
}
