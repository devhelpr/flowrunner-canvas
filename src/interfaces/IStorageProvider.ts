export interface IStorageProvider {
  storeFlowPackage: (flowPackage: any) => void;
  getFlowPackage: () => any;
  addFlow: (name, flow) => void;
  getFlows: () => any[];
  getFlow: (flowId: string) => any[];
  saveFlow: (flowId: string, flow: any[]) => void;
  getTasks: () => any[];
  getApiProxyUrl: () => string;
  setSelectedFlow: (flowId: string) => void;
  getSelectedFlow: () => string;
  isUI: boolean;
}
